// Test upload functionality directly
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('=== UPLOAD API TEST ===');
    
    // Mock auth for testing
    const user = { email: 'test@example.com', id: 'test-user' };
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(`File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
    
    return NextResponse.json({ 
      message: "Test upload successful",
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
