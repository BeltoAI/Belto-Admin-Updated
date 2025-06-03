// Test upload functionality with detailed debugging
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    console.log('=== Upload Debug Test ===');
    
    // Check if uploads directory is writable
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    console.log('Uploads directory:', uploadsDir);
    console.log('Directory exists:', fs.existsSync(uploadsDir));
    
    // Test write permissions
    try {
      const testFile = path.join(uploadsDir, 'write-test.txt');
      fs.writeFileSync(testFile, 'test content');
      fs.unlinkSync(testFile);
      console.log('✅ Write permissions: OK');
    } catch (err) {
      console.log('❌ Write permissions error:', err.message);
      return;
    }
    
    // Test PDF processing libraries
    try {
      const PdfReader = require('pdfreader').PdfReader;
      console.log('✅ pdfreader library: loaded');
    } catch (err) {
      console.log('❌ pdfreader library error:', err.message);
    }
    
    try {
      const mammoth = require('mammoth');
      console.log('✅ mammoth library: loaded');
    } catch (err) {
      console.log('❌ mammoth library error:', err.message);
    }
    
    // Create a test PDF content
    const testPdfBuffer = Buffer.from('test pdf content');
    console.log('Test buffer created, size:', testPdfBuffer.length);
    
    // Test the extractTextFromPdf function
    const { PdfReader } = require('pdfreader');
    
    const extractTextFromPdf = (buffer) => {
      return new Promise((resolve, reject) => {
        try {
          let currentPage = 1;
          let rows = {};
          let hasError = false;
          
          const pdfReader = new PdfReader();
          
          // Set a timeout for PDF processing
          const timeout = setTimeout(() => {
            if (!hasError) {
              console.log('PDF processing timeout, returning partial content');
              resolve('partial content');
            }
          }, 5000); // 5 second timeout for test
          
          pdfReader.parseBuffer(buffer, (err, item) => {
            if (hasError) return;
            
            if (err) {
              hasError = true;
              clearTimeout(timeout);
              console.log('PDF parsing error (expected for test buffer):', err.message);
              resolve('');
              return;
            }
            
            if (!item) {
              clearTimeout(timeout);
              resolve('extracted text');
              return;
            }
          });
        } catch (error) {
          console.log('PDF extraction setup error:', error.message);
          resolve('');
        }
      });
    };
    
    console.log('Testing PDF extraction...');
    const result = await extractTextFromPdf(testPdfBuffer);
    console.log('PDF extraction result:', result);
    
    console.log('=== Test Complete ===');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testUpload();
