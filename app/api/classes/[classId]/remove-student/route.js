import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Class from '@/models/Class';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const classId = params.classId;
    const { studentId } = await request.json();

    if (!classId || !studentId) {
      return NextResponse.json(
        { message: 'Class ID and Student ID are required' },
        { status: 400 }
      );
    }
    
    // Skip authentication check for now to troubleshoot the basic functionality
    
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $pull: { students: studentId } },
      { new: true }
    );

    if (!updatedClass) {
      return NextResponse.json({ message: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Student removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing student from class:', error);
    return NextResponse.json(
      { message: 'Failed to remove student', error: error.message },
      { status: 500 }
    );
  }
}