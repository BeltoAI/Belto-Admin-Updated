import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Lecture from '@/models/Lecture';
import Class from '@/models/Class';
import { verifyAuth } from '@/lib/auth';

// Get all lectures for a class
export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const classData = await Class.findById(params.classId);
    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this class
    if (classData.professorId.toString() !== user.userId && 
        !classData.students.includes(user.userId)) {
      return NextResponse.json(
        { error: "Unauthorized access to class" },
        { status: 403 }
      );
    }

    const lectures = await Lecture.find({ classId: params.classId })
      .sort({ startDate: 1 });
    return NextResponse.json(lectures);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lectures" },
      { status: 500 }
    );
  }
}

// Create new lecture
export async function POST(request, { params }) {
  await connectDB();
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const classData = await Class.findById(params.classId);
    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Verify user is the professor of this class
    if (classData.professorId.toString() !== user.userId) {
      return NextResponse.json(
        { error: "Only professors can create lectures" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const newLecture = new Lecture({
      ...body,
      classId: params.classId
    });

    const savedLecture = await newLecture.save();
    
    // Update class with new lecture
    await Class.findByIdAndUpdate(
      params.classId,
      { $push: { lectures: savedLecture._id } }
    );

    return NextResponse.json(savedLecture, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}