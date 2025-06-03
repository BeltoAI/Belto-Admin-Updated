// pages/api/classes/[classId]/chat-sessions.js
import dbConnect from '@/lib/dbConnect';
import Class from '@/models/Class';
import Lecture from '@/models/Lecture';
import ChatSession from '@/models/Chat';

export default async function handler(req, res) {
  const { classId } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    // Connect to the database
    await dbConnect();
    
    // Find the class to verify it exists and check permissions
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    
    // Check if the user is authorized (professor of the class or admin)
    const isProfessor = classDoc.professorId.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isProfessor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Get all lecture IDs for this class
    const lectures = await Lecture.find({ classId: classId });
    const lectureIds = lectures.map(lecture => lecture._id);
    
    // Get all chat sessions for these lectures
    const chatSessions = await ChatSession.find({
      lectureId: { $in: lectureIds }
    }).sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      success: true, 
      data: {
        count: chatSessions.length,
        chatSessions
      }
    });
    
  } catch (error) {
    console.error('Error fetching class chat sessions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching chat sessions', 
      error: error.message 
    });
  }
}