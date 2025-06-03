// app/api/classes/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Class from '@/models/Class';

import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  await connectDB();
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 } 
      );
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');

    if (classId) {
      const classData = await Class.findById(classId);
      if (!classData) {
        return NextResponse.json(
          { error: "Class not found" },
          { status: 404 }
        );
      }
      
      if (classData.professorId.toString() !== user.userId) {
        return NextResponse.json(
          { error: "Unauthorized access to class" },
          { status: 403 }
        );
      }

      return NextResponse.json(classData);
    } else {
      const classes = await Class.find({ professorId: user.userId });
      return NextResponse.json(classes);
    }
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch class data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    const user = JSON.parse(request.headers.get('user'));

    if (user.role !== 'professor') {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const requiredFields = ['name', 'startDate', 'endDate', 'enrollmentCode', 'enrollmentUrl'];
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const newClass = new Class({
      ...body,
      professorId: user.userId
    });

    const savedClass = await newClass.save();
    
    return NextResponse.json(savedClass, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Enrollment code must be unique" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    const user = JSON.parse(request.headers.get('user'));
    const body = await request.json();

    if (user.role !== 'professor') {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Find existing class
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingClass.professorId.toString() !== user.userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Date validation
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

    // Update enrollment URL if code changes
    if (body.enrollmentCode && body.enrollmentCode !== existingClass.enrollmentCode) {
      body.enrollmentUrl = `/enroll/${body.enrollmentCode}`;
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedClass);
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Enrollment code must be unique" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    if (existingClass.professorId.toString() !== user.userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    await Class.findByIdAndDelete(classId);
    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    const user = await verifyAuth(request);
    const body = await request.json();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    if (existingClass.professorId.toString() !== user.userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $set: { status: body.status } },
      { new: true }
    );

    return NextResponse.json(updatedClass);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}