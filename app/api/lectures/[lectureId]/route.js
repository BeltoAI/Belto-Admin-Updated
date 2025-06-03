// app/api/lectures/[lectureId]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Lecture from '@/models/Lecture';
import Class from '@/models/Class';
import { verifyAuth } from '@/lib/auth';

// Get single lecture
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

    const lecture = await Lecture.findById(params.lectureId);
    if (!lecture) {
      return NextResponse.json(
        { error: "Lecture not found" },
        { status: 404 }
      );
    }

    const classData = await Class.findById(lecture.classId);
    if (!classData) {
      return NextResponse.json(
        { error: "Associated class not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this class
    if (classData.professorId.toString() !== user.userId && 
        !classData.students.includes(user.userId)) {
      return NextResponse.json(
        { error: "Unauthorized access to lecture" },
        { status: 403 }
      );
    }

    return NextResponse.json(lecture);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lecture" },
      { status: 500 }
    );
  }
}

// Update lecture
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

    const lecture = await Lecture.findById(params.lectureId);
    if (!lecture) {
      return NextResponse.json(
        { error: "Lecture not found" },
        { status: 404 }
      );
    }

    const classData = await Class.findById(lecture.classId);
    if (!classData) {
      return NextResponse.json(
        { error: "Associated class not found" },
        { status: 404 }
      );
    }

    // Verify user is the professor of this class
    if (classData.professorId.toString() !== user.userId) {
      return NextResponse.json(
        { error: "Only professors can update lectures" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Remove empty string fields
    if (body.maxTokens === "") delete body.maxTokens;
    if (body.tokenPredictionLimit === "") delete body.tokenPredictionLimit;
    if (body.temperature === "") delete body.temperature;

    // Convert remaining string fields to numbers
    if (body.maxTokens !== undefined) {
      body.maxTokens = parseInt(body.maxTokens, 10);
    }
    if (body.tokenPredictionLimit !== undefined) {
      body.tokenPredictionLimit = parseInt(body.tokenPredictionLimit, 10);
    }
    if (body.temperature !== undefined) {
      body.temperature = parseFloat(body.temperature);
    }

    // Validate dates if present
    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Validate temperature if present
    if (
      body.temperature !== undefined &&
      (isNaN(body.temperature) || body.temperature < 0 || body.temperature > 2)
    ) {
      return NextResponse.json(
        { error: "Temperature must be between 0 and 2" },
        { status: 400 }
      );
    }

    // Validate maxTokens if present
    if (
      body.maxTokens !== undefined &&
      (isNaN(body.maxTokens) || body.maxTokens < 1)
    ) {
      return NextResponse.json(
        { error: "Max tokens must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate tokenPredictionLimit if present
    if (
      body.tokenPredictionLimit !== undefined &&
      (isNaN(body.tokenPredictionLimit) || body.tokenPredictionLimit < 1)
    ) {
      return NextResponse.json(
        { error: "Token prediction must be greater than 0" },
        { status: 400 }
      );
    }

    const updatedLecture = await Lecture.findByIdAndUpdate(
      params.lectureId,
      body,
      { new: true }
    );

    return NextResponse.json(updatedLecture);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// Delete lecture
export async function DELETE(request, { params }) {
  await connectDB();
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const lecture = await Lecture.findById(params.lectureId);
    if (!lecture) {
      return NextResponse.json(
        { error: "Lecture not found" },
        { status: 404 }
      );
    }

    const classData = await Class.findById(lecture.classId);
    if (!classData) {
      return NextResponse.json(
        { error: "Associated class not found" },
        { status: 404 }
      );
    }

    // Verify user is the professor of this class
    if (classData.professorId.toString() !== user.userId) {
      return NextResponse.json(
        { error: "Only professors can delete lectures" },
        { status: 403 }
      );
    }

    // Remove lecture from class
    await Class.findByIdAndUpdate(
      lecture.classId,
      { $pull: { lectures: params.lectureId } }
    );

    // Delete the lecture
    await Lecture.findByIdAndDelete(params.lectureId);

    return NextResponse.json(
      { message: "Lecture deleted successfully" }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}