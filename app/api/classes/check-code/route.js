import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Class from '@/models/Class';

export async function GET(request) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get the code from query params
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'Code parameter is required' }, { status: 400 });
    }
    
    // Check if a class with this enrollment code already exists
    const existingClass = await Class.findOne({ enrollmentCode: code });
    return NextResponse.json({ exists: !!existingClass });
  } catch (error) {
    console.error('Error checking enrollment code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}