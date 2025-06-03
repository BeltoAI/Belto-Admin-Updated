// app/api/files/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const uploadsDirectory = path.join(process.cwd(), 'public/uploads');
    const files = fs.readdirSync(uploadsDirectory).map(filename => {
      const filePath = path.join(uploadsDirectory, filename);
      const stats = fs.statSync(filePath);
      return {
        name: filename,
        timestamp: stats.mtime,
        size: stats.size
      };
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return NextResponse.json(
      { message: 'Error reading files' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { message: 'Filename is required' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'public/uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    fs.unlinkSync(filePath);

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { message: 'Error deleting file' },
      { status: 500 }
    );
  }
}