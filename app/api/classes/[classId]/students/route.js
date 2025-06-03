import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Class from '@/models/Class';
import Student from '@/models/Student';

// Get all students in a class
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { classId } = params;
        const singleClass = await Class.findById(classId);
        if (!singleClass) {
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }
        // now, returns the array of students here from the single class
        const studentsArray = singleClass.students;
        const students = await Student.find({ _id: { $in: studentsArray } });
        return NextResponse.json(students);
    } catch (error) {
        console.error('GET Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}