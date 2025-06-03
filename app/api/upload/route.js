// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { PdfReader } from 'pdfreader';
import mammoth from 'mammoth';

// PDF text extraction using pdfreader with improved error handling
const extractTextFromPdf = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔍 Starting PDF extraction...');
      console.log(`   - Buffer size: ${buffer.length} bytes`);
      
      let currentPage = 1;
      let rows = {};
      let hasError = false;
      let textItems = 0;
      
      const pdfReader = new PdfReader();
      
      // Set a timeout for PDF processing
      const timeout = setTimeout(() => {
        if (!hasError) {
          console.log(`⏰ PDF processing timeout, returning partial content. Extracted ${textItems} text items.`);
          resolve(formatPdfText(rows));
        }
      }, 30000); // 30 second timeout
      
      pdfReader.parseBuffer(buffer, (err, item) => {
        if (hasError) return; // Prevent multiple callbacks after error
        
        if (err) {
          hasError = true;
          clearTimeout(timeout);
          console.error('❌ PDF parsing error:', err.message);
          console.error('   Error code:', err.code);
          console.error('   Error details:', err);
          
          // Check if it's a specific PDF format issue
          if (err.message.includes('Invalid PDF') || err.message.includes('corrupted')) {
            console.log('🔧 Attempting graceful fallback for potentially corrupted PDF');
          }
          
          // Don't reject completely, return empty string to allow upload to continue
          resolve('');
          return;
        }
        
        if (!item) {
          // End of file, resolve with extracted text
          clearTimeout(timeout);
          console.log(`✅ PDF extraction completed. Total text items: ${textItems}`);
          const result = formatPdfText(rows);
          console.log(`   - Final text length: ${result.length} characters`);
          resolve(result);
          return;
        }
        
        if (item.page) {
          // New page
          currentPage = item.page;
          console.log(`📄 Processing page ${currentPage}`);
          if (!rows[currentPage]) {
            rows[currentPage] = {};
          }
        }
        
        if (item.text) {
          // Add text with position
          textItems++;
          const y = Math.round(item.y || 0);
          if (!rows[currentPage]) {
            rows[currentPage] = {};
          }
          if (!rows[currentPage][y]) {
            rows[currentPage][y] = [];
          }
          rows[currentPage][y].push(item.text);
          
          // Log every 100 text items for progress
          if (textItems % 100 === 0) {
            console.log(`   - Processed ${textItems} text items...`);
          }
        }
      });
    } catch (error) {
      console.error('💥 PDF extraction setup error:', error);
      console.error('   Error stack:', error.stack);
      resolve(''); // Return empty string instead of rejecting
    }
  });
};

// Helper function to format PDF text
const formatPdfText = (rows) => {
  try {
    let fullText = '';
    const pages = Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const pageNum of pages) {
      if (Object.keys(rows[pageNum]).length > 0) {
        fullText += `\n---- Page ${pageNum} ----\n\n`;
        const pageRows = rows[pageNum];
        const yPositions = Object.keys(pageRows).sort((y1, y2) => parseFloat(y1) - parseFloat(y2));
        
        for (const y of yPositions) {
          if (pageRows[y] && pageRows[y].length > 0) {
            fullText += pageRows[y].join(' ') + '\n';
          }
        }
      }
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error formatting PDF text:', error);
    return '';
  }
};

// Word document text extraction
const extractTextFromWord = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting Word document content:', error);
    return '';
  }
};

// Plain text extraction
const extractTextFromPlainText = (buffer) => {
  return buffer.toString('utf-8');
};

// Content extraction based on file type with improved error handling
const extractFileContent = async (file, buffer) => {
  const fileType = file.type;
  const fileName = file.name || 'unknown';
  
  console.log(`🔍 Extracting content from ${fileName}`);
  console.log(`   - File type: ${fileType}`);
  console.log(`   - Buffer size: ${buffer.length} bytes`);
  
  try {
    if (fileType === 'application/pdf') {
      console.log('📄 Processing PDF file...');
      const startTime = Date.now();
      const content = await extractTextFromPdf(buffer);
      const duration = Date.now() - startTime;
      console.log(`✅ PDF extraction completed in ${duration}ms. Content length: ${content.length}`);
      return content;
      
    } else if (
      fileType === 'application/msword' || 
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      console.log('📝 Processing Word document...');
      const startTime = Date.now();
      const content = await extractTextFromWord(buffer);
      const duration = Date.now() - startTime;
      console.log(`✅ Word extraction completed in ${duration}ms. Content length: ${content.length}`);
      return content;
      
    } else if (fileType === 'text/plain') {
      console.log('📄 Processing text file...');
      const content = extractTextFromPlainText(buffer);
      console.log(`✅ Text extraction completed. Content length: ${content.length}`);
      return content;
      
    } else {
      console.log(`⚠️ Unsupported file type: ${fileType}. File will be uploaded without content extraction.`);
      return '';
    }
  } catch (error) {
    console.error(`💥 Error extracting content from ${fileName}:`, error);
    console.error('   Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // Return empty string instead of throwing - allows upload to continue
    return '';
  }
};

export async function POST(request) {
  try {
    console.log('=== Upload API called (Vercel Serverless) ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    
    const user = await verifyAuth(request);
    if (!user) {
      console.log('❌ Unauthorized upload attempt');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log('✅ User authenticated:', user.email);

    let formData;
    try {
      formData = await request.formData();
      console.log('✅ FormData parsed successfully');
    } catch (formError) {
      console.error('❌ FormData parsing error:', formError);
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    const file = formData.get('file');
    
    if (!file) {
      console.log('❌ No file provided in request');
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    console.log(`✅ File received: ${file.name}`);
    console.log(`   - Size: ${file.size} bytes`);
    console.log(`   - Type: ${file.type}`);
    console.log(`   - Last Modified: ${file.lastModified}`);

    // Validate file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Get file buffer
    let bytes, buffer;
    try {
      console.log('📦 Converting file to buffer...');
      bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      console.log(`✅ File buffer created, size: ${buffer.length} bytes`);
    } catch (bufferError) {
      console.error('❌ Buffer creation error:', bufferError);
      return NextResponse.json(
        { error: "Failed to process file data" },
        { status: 500 }
      );
    }

    // Create unique identifier for the file (no file system storage)
    const timestamp = Date.now();
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
    
    console.log(`📄 Processing file: ${uniqueFileName}`);
    console.log('ℹ️ Note: File stored in memory only (Vercel serverless environment)');

    // Extract content from the file (don't let this fail the upload)
    let extractedContent = '';
    try {
      console.log('🔍 Starting content extraction...');
      extractedContent = await extractFileContent(file, buffer);
      console.log(`✅ Content extraction completed. Length: ${extractedContent.length}`);
      if (extractedContent.length > 0) {
        console.log(`📄 Content preview: ${extractedContent.substring(0, 100)}...`);
      }
    } catch (extractionError) {
      console.error('⚠️ Content extraction failed, but continuing with upload:', extractionError);
      extractedContent = '';
    }
    
    // Convert buffer to base64 for storage (alternative to file system)
    const base64Data = buffer.toString('base64');
    
    // Create a data URL that can be used to reference the file
    const dataUrl = `data:${file.type};base64,${base64Data}`;
    
    console.log(`🎉 Upload processed successfully!`);
    console.log(`   - Original name: ${file.name}`);
    console.log(`   - Unique name: ${uniqueFileName}`);
    console.log(`   - File size: ${file.size} bytes`);
    console.log(`   - Content length: ${extractedContent.length} characters`);
    console.log(`   - Base64 size: ${base64Data.length} characters`);

    const response = { 
      fileUrl: dataUrl, // Return data URL instead of file path
      fileName: file.name,
      uniqueFileName: uniqueFileName,
      extractedContent,
      message: "File uploaded and processed successfully",
      fileSize: file.size,
      contentLength: extractedContent.length,
      fileType: file.type,
      uploadedAt: new Date().toISOString()
    };    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 Critical upload error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: `Failed to upload file: ${error.message}` },
      { status: 500 }
    );
  }
}