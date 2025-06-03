// app/api/chat-context/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import ChatSession from '@/models/Chat';
import Lecture from '@/models/Lecture';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    // Verify user authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get lectureId from query parameters
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');
    
    if (!lectureId) {
      return NextResponse.json({ error: 'lectureId is required' }, { status: 400 });
    }

    // Verify lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    // Get all chat sessions for this lecture
    const chatSessions = await ChatSession.find({ lectureId })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // Calculate summary statistics
    let totalMessages = 0;
    let totalUserMessages = 0;
    let totalBotMessages = 0;
    let totalSessions = chatSessions.length;
    let totalAttachments = 0;
    
    // Process sessions to count messages and extract key information
    const processedSessions = chatSessions.map(session => {
      const sessionMessages = session.messages || [];
      const userMessages = sessionMessages.filter(msg => !msg.isBot);
      const botMessages = sessionMessages.filter(msg => msg.isBot);
      
      totalMessages += sessionMessages.length;
      totalUserMessages += userMessages.length;
      totalBotMessages += botMessages.length;
      
      // Count attachments
      sessionMessages.forEach(msg => {
        if (msg.attachments && msg.attachments.length > 0) {
          totalAttachments += msg.attachments.length;
        }
      });

      return {
        sessionId: session._id,
        userId: session.userId,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: sessionMessages.length,
        userMessageCount: userMessages.length,
        botMessageCount: botMessages.length,
        messages: sessionMessages.map(msg => ({
          _id: msg._id,
          isBot: msg.isBot,
          avatar: msg.avatar,
          name: msg.name,
          message: msg.message,
          suggestions: msg.suggestions,
          attachments: msg.attachments,
          timestamp: msg.timestamp,
          tokenUsage: msg.tokenUsage
        }))
      };
    });

    // Get unique users who have chatted in this lecture
    const uniqueUsers = [...new Set(chatSessions.map(session => session.userId))];

    // Prepare response
    const response = {
      success: true,
      lectureId: lectureId,
      lectureTitle: lecture.title,
      summary: {
        totalSessions,
        totalMessages,
        totalUserMessages,
        totalBotMessages,
        totalAttachments,
        uniqueUsers: uniqueUsers.length,
        averageMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0
      },
      chatSessions: processedSessions,
      metadata: {
        retrievedAt: new Date().toISOString(),
        userId: user.userId
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error retrieving chat context:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve chat context', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
