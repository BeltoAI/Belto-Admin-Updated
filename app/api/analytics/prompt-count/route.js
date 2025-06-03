import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request) {
  let client = null;
  
  try {
    // Get userId from query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Connect directly to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Create query for user ID - handle both string and ObjectId formats
    let userIdQuery;
    try {
      if (userId.match(/^[0-9a-fA-F]{24}$/)) {
        userIdQuery = { 
          $or: [
            { professorId: userId },
            { professorId: new ObjectId(userId) }
          ]
        };
      } else {
        userIdQuery = { professorId: userId };
      }
    } catch (e) {
      userIdQuery = { professorId: userId };
    }
    
    // STEP 1: Get only classes created by this professor
    const classes = await db.collection('classes')
      .find(userIdQuery)
      .project({ 
        _id: 1, 
        name: 1, 
        lectures: 1 
      })
      .toArray();
    
    console.log(`Found ${classes.length} classes for professor ID: ${userId}`);
    
    if (classes.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: {
          grandTotal: 0,
          classSummary: [],
          reactions: {
            likes: 0,
            dislikes: 0
          }
        }
      });
    }
    
    // STEP 2: Extract all lecture IDs from these classes
    const allLectureIds = classes.reduce((ids, classItem) => {
      if (Array.isArray(classItem.lectures)) {
        classItem.lectures.forEach(id => {
          ids.push(typeof id === 'string' ? id : id.toString());
        });
      }
      return ids;
    }, []);
    
    if (allLectureIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          grandTotal: 0,
          classSummary: classes.map(c => ({
            _id: c._id.toString(),
            className: c.name || 'Unnamed Class',
            totalPrompts: 0,
            lecturePrompts: []
          })),
          reactions: {
            likes: 0,
            dislikes: 0
          }
        }
      });
    }
    
    // STEP 3: Get all chat sessions for these lectures in one query
    const chatSessions = await db.collection('chatsessions').find({
      lectureId: { $in: allLectureIds }
    }, {
      projection: { 
        _id: 1,
        "messages.isBot": 1,
        "messages._id": 1,
        lectureId: 1
      }
    }).toArray();
    
    console.log(`Found ${chatSessions.length} chat sessions for all lectures`);
    
    // STEP 4: Process the data to count user messages
    // Create a map of lecture counts
    const lectureCountMap = {};
    let grandTotal = 0;
    
    // Create a set of session IDs to use for fetching reactions
    const sessionIds = chatSessions.map(session => session._id.toString());
    
    for (const session of chatSessions) {
      if (!Array.isArray(session.messages) || !session.lectureId) {
        continue;
      }
      
      // Count user messages
      const userMsgCount = session.messages.filter(msg => msg.isBot === false).length;
      
      // Add to lecture count
      if (!lectureCountMap[session.lectureId]) {
        lectureCountMap[session.lectureId] = 0;
      }
      lectureCountMap[session.lectureId] += userMsgCount;
      
      // Add to grand total
      grandTotal += userMsgCount;
    }
    
    // STEP 5: Get reactions for these sessions
    let likes = 0;
    let dislikes = 0;
    
    if (sessionIds.length > 0) {
      // Get all reactions for these sessions
      const reactions = await db.collection('messagereactions').find({
        sessionId: { $in: sessionIds }
      }).toArray();
      
      console.log(`Found ${reactions.length} message reactions`);
      
      // Count likes and dislikes
      for (const reaction of reactions) {
        if (reaction.reactionType === 'like') {
          likes++;
        } else if (reaction.reactionType === 'dislike') {
          dislikes++;
        }
      }
    }
    
    // STEP 6: Build the class summary
    const classSummary = classes.map(classItem => {
      const lecturePrompts = [];
      let classTotal = 0;
      
      // Calculate totals for each lecture in this class
      if (Array.isArray(classItem.lectures)) {
        for (const lectureId of classItem.lectures) {
          const lecId = typeof lectureId === 'string' ? lectureId : lectureId.toString();
          const count = lectureCountMap[lecId] || 0;
          
          lecturePrompts.push({
            lectureId: lecId,
            count: count
          });
          
          classTotal += count;
        }
      }
      
      return {
        _id: classItem._id.toString(),
        className: classItem.name || 'Unnamed Class',
        totalPrompts: classTotal,
        lecturePrompts: lecturePrompts
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        grandTotal,
        classSummary,
        reactions: {
          likes,
          dislikes
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching prompt counts:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError);
      }
    }
  }
}