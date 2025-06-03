import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Setting from '@/models/Setting';
import Class from '@/models/Class';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { enrollmentCode } = await request.json();
    
    if (!enrollmentCode) {
      return NextResponse.json({ error: 'Enrollment code is required' }, { status: 400 });
    }

    // Find the class with the given enrollment code
    const classToEnroll = await Class.findOne({ enrollmentCode });
    
    if (!classToEnroll) {
      return NextResponse.json({ error: 'Invalid enrollment code' }, { status: 404 });
    }

    // Check if the class is created by the user
    const isCreator = classToEnroll.createdBy.toString() === user.userId;
    
    if (!isCreator) {
      return NextResponse.json({ error: 'You can only enroll in classes you created' }, { status: 403 });
    }

    // Get user settings
    let settings = await Setting.findOne({ userId: user.userId });
    
    // Create settings if they don't exist
    if (!settings) {
      settings = new Setting({
        userId: user.userId,
        enrolledClasses: []
      });
    }

    // Check if the class is already enrolled
    const alreadyEnrolled = settings.enrolledClasses.some(
      c => c.classId.toString() === classToEnroll._id.toString()
    );
    
    if (alreadyEnrolled) {
      return NextResponse.json({ error: 'Already enrolled in this class' }, { status: 409 });
    }

    // Add the class to enrolled classes
    settings.enrolledClasses.push({
      classId: classToEnroll._id,
      enrollmentCode,
      dateEnrolled: new Date(),
      overrideSettings: {
        allowCopyPaste: null,
        notifications: null
      }
    });

    await settings.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully enrolled in the class',
      class: {
        id: classToEnroll._id,
        name: classToEnroll.name,
        enrollmentCode
      }
    });
  } catch (error) {
    console.error('Error enrolling in class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}