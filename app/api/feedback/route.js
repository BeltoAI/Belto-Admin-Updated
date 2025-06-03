import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Feedback from '@/models/Feedback';
import Student from '@/models/Student';


export async function GET(request) {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const classId = searchParams.get('classId');
      
      const query = classId ? { classId } : {};
      
      const feedbacks = await Feedback.find(query)
        .populate('studentId', 'username email')
        .sort({ createdAt: -1 });
      
      return NextResponse.json({ feedbacks });
    } catch (error) {
      console.error('Detailed error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
}  