import { NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { PdfReader } from 'pdfreader';
import mammoth from 'mammoth';

// Updated route configuration using the new format
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set to maximum allowed for hobby plan
export const dynamicParams = true;
export const runtime = 'nodejs';

// Helper to ensure directory exists
async function ensureDir(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Helper to generate unique filenames
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// PDF text extraction using pdfreader
const extractTextFromPdf = (buffer) => {
  return new Promise((resolve, reject) => {
    let text = '';
    let currentPage = 1;
    let rows = {};
    
    // Use pdfreader for text extraction
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!item) {
        // End of file, resolve with extracted text
        let fullText = '';
        Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b)).forEach(pageNum => {
          fullText += `\n---- Page ${pageNum} ----\n\n`;
          const pageRows = rows[pageNum];
          Object.keys(pageRows)
            .sort((y1, y2) => parseFloat(y1) - parseFloat(y2))
            .forEach(y => {
              fullText += pageRows[y].join(' ') + '\n';
            });
        });
        
        resolve(fullText.trim());
        return;
      }
      
      if (item.page) {
        // New page
        currentPage = item.page;
        rows[currentPage] = {};
      }
      
      if (item.text) {
        // Add text with position
        const y = item.y.toFixed(3);
        rows[currentPage] = rows[currentPage] || {};
        rows[currentPage][y] = rows[currentPage][y] || [];
        rows[currentPage][y].push(item.text);
      }
    });
  });
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    const fileType = file.type;
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Convert file to Buffer for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await ensureDir(uploadDir);
    
    // Save file to disk
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = join(uploadDir, uniqueFilename);
    
    try {
      await writeFile(filePath, buffer);
      console.log('File saved to', filePath);
    } catch (err) {
      console.error('Error saving file:', err);
    }

    // Extract text from file based on its type
    let text = '';
    
    if (fileType === 'application/pdf') {
      try {
        // First check if PDF is valid using pdf-lib
        const pdfDoc = await PDFDocument.load(buffer);
        const pageCount = pdfDoc.getPageCount();
        console.log(`PDF has ${pageCount} pages`);
        
        // Then extract text using pdfreader
        text = await extractTextFromPdf(buffer);
        
        if (!text || text.trim().length === 0) {
          text = `This PDF appears to contain ${pageCount} pages but no extractable text. It may be a scanned document or image-based PDF.`;
        }
      } catch (err) {
        console.error('Error processing PDF:', err);
        text = 'Could not extract text from this PDF. The file may be corrupted or password-protected.';
      }
    } else {
      // Process DOC/DOCX file
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        
        if (!text || text.trim().length === 0) {
          text = 'The document appears to be empty or contains no extractable text.';
        }
      } catch (err) {
        console.error('Error extracting text from document:', err);
        text = 'Could not extract text from this document. The file may be corrupted.';
      }
    }

    // Truncate if text is too long
    const originalLength = text.length;
    const maxLength = 50000;
    
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + 
        `\n\n[Note: Content truncated (showing ${maxLength} of ${originalLength} characters)]`;
    }
    
    console.log(`Successfully extracted ${text.length} characters from ${file.name}`);
    
    // Return the extracted text and file URL
    return NextResponse.json({
      text,
      url: `/uploads/${uniqueFilename}`,
      filename: file.name,
      size: buffer.length,
      type: fileType
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}