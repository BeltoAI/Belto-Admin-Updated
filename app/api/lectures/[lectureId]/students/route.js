import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Lecture from "@/models/Lecture";
import Class from "@/models/Class";
import User from "@/models/User";
import { verifyAuth } from "@/lib/auth";

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
    
    const lectureId = params.lectureId;
    const lecture = await Lecture.findById(lectureId);
    
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
    
    // Ensure the user has access to this lecture (either professor or enrolled student)
    if (classData.professorId.toString() !== user.userId && 
        !classData.students.includes(user.userId)) {
      return NextResponse.json(
        { error: "Unauthorized access to lecture students" },
        { status: 403 }
      );
    }
    
    // Get student details
    const studentIds = classData.students;
    const students = await User.find(
      { _id: { $in: studentIds } },
      { password: 0 } // Exclude password
    );
    
    // Format response to match expected client structure
    const formattedStudents = students.map(student => ({
      id: student._id.toString(),
      username: student.name || student.username,
      email: student.email,
      selected: false
    }));
    
    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("Error fetching lecture students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}