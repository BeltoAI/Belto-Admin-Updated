// app/api/classes/[id]/archive/route.js
import connectDB from '@/lib/dbConnect';
import Class from '@/models/Class';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  await connectDB();
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const classId = params.classId;
    const existingClass = await Class.findById(classId);
    
    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Toggle the status
    const newStatus = existingClass.status === 'active' ? 'archived' : 'active';
    
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { status: newStatus },
      { new: true }
    );

    console.log(`Class ${classId} status updated to ${newStatus}`);
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Archive Error:', error);
    return NextResponse.json(
      { error: "Failed to update class status" },
      { status: 500 }
    );
  }
}