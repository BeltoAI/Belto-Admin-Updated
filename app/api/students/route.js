import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Student from '@/models/Student';

// GET all students
export async function GET() {
    try {
        await connectDB();
        const students = await Student.find({}).select('-password');
        return NextResponse.json({ students }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST new student
export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            );
        }

        const student = await Student.create(body);
        return NextResponse.json({ student }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT update student
export async function PUT(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        const student = await Student.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');

        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ student }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE student
export async function DELETE(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        const student = await Student.findByIdAndDelete(id);
        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Student deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}   