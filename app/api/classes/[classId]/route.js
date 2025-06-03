import connectDB from '@/lib/dbConnect';
import Class from '@/models/Class';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Get single class
export async function GET(request, { params }) {
  console.log(params)
  await connectDB();
  try {
    const singleClass = await Class.findById(params.classId);
    if (!singleClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(singleClass);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// Update class
export async function PATCH(request, { params }) {
  await connectDB();
  try {
    const body = await request.json();
    const updatedClass = await Class.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedClass);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// Delete class
export async function DELETE(request, { params }) {
  await connectDB();
  try {
    const deletedClass = await Class.findByIdAndDelete(params.classId);
    
    if (!deletedClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}

// Archive/Unarchive class
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

    console.log(params);

    // Ensure the correct parameter name is used
    const existingClass = await Class.findById(params.classId);
    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }
    console.log(existingClass);

    // // Toggle the status of the class by classId 
    // keep other fields the same and only update the status field
    const updatedClass = await Class.findByIdAndUpdate(
      params.classId,
      { $set: { status: existingClass.status === 'active' ? 'archived' : 'active' } },
      { new: true }
    );

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Archive Error:', error);
    return NextResponse.json(
      { error: "Failed to update class status" },
      { status: 500 }
    );
  }
}