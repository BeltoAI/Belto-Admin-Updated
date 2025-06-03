import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import AIPreference from '@/models/AIPreference';
import { verifyAuth } from '@/lib/auth';
import Lecture from '@/models/Lecture';

// Create AI Preference
export async function POST(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Check for required fields
    if (!body.lectureId || !body.model) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Format numeric fields
    if (body.maxTokens) body.maxTokens = parseInt(body.maxTokens);
    if (body.numPrompts) body.numPrompts = parseInt(body.numPrompts);
    if (body.tokenPredictionLimit) body.tokenPredictionLimit = parseInt(body.tokenPredictionLimit);
    if (body.temperature) body.temperature = parseFloat(body.temperature);
    
    // Check for existing preference for this lecture
    const existingPref = await AIPreference.findOne({ lectureId: body.lectureId });
    if (existingPref) {
      return NextResponse.json({ 
        error: 'Preference for this lecture already exists. Use PUT to update.' 
      }, { status: 409 });
    }
    
    const pref = new AIPreference({
      ...body,
      updatedAt: Date.now()
    });
    
    const saved = await pref.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error creating AI preference:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get AI Preference by lectureId
export async function GET(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get lectureId from query params
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');
    
    if (!lectureId) {
      return NextResponse.json({ error: 'lectureId is required' }, { status: 400 });
    }
    
    const aiPreference = await AIPreference.findOne({ lectureId });
    if (!aiPreference) {
      return NextResponse.json({ error: 'AI preference not found' }, { status: 404 });
    }
    
    return NextResponse.json(aiPreference);
  } catch (error) {
    console.error('Error fetching AI preference:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update AI Preference
export async function PUT(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
      // Format numeric fields
    if (body.maxTokens) body.maxTokens = parseInt(body.maxTokens);
    if (body.numPrompts) body.numPrompts = parseInt(body.numPrompts);
    if (body.tokenPredictionLimit) body.tokenPredictionLimit = parseInt(body.tokenPredictionLimit);
    if (body.temperature) body.temperature = parseFloat(body.temperature);
    
    // Handle extracted content if provided
    if (body.extractedContent) {
      // If it's a single object, convert to array format
      if (typeof body.extractedContent === 'object' && !Array.isArray(body.extractedContent)) {
        if (body.extractedContent.content) {
          body.extractedContent = [{
            url: body.extractedContent.source || body.accessUrl || 'Unknown',
            title: body.extractedContent.title || 'Extracted Content',
            content: body.extractedContent.content,
            extractedAt: body.extractedContent.extractedAt || new Date(),
            contentType: body.extractedContent.type || 'webpage',
            metadata: {
              wordCount: body.extractedContent.content.split(/\s+/).length,
              language: 'en',
              encoding: 'UTF-8'
            }
          }];
        }
      }
    }
    
    // Check if preference exists
    let aiPreference;
    
    if (body._id) {
      // Update by ID
      aiPreference = await AIPreference.findByIdAndUpdate(
        body._id,
        { 
          ...body,
          updatedAt: Date.now() 
        },
        { new: true }
      );
    } else if (body.lectureId) {
      // Update by lectureId or create new
      aiPreference = await AIPreference.findOneAndUpdate(
        { lectureId: body.lectureId },
        { 
          ...body,
          updatedAt: Date.now() 
        },
        { new: true, upsert: true }
      );
    } else {
      return NextResponse.json({ error: 'Either _id or lectureId is required' }, { status: 400 });
    }
    
    if (!aiPreference) {
      return NextResponse.json({ error: 'Failed to update AI preference' }, { status: 500 });
    }
    
    return NextResponse.json(aiPreference);
  } catch (error) {
    console.error('Error updating AI preference:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete AI Preference
export async function DELETE(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');
    const id = searchParams.get('id');
    
    if (!lectureId && !id) {
      return NextResponse.json({ error: 'Either lectureId or id is required' }, { status: 400 });
    }
    
    let result;
    if (id) {
      result = await AIPreference.findByIdAndDelete(id);
    } else {
      result = await AIPreference.findOneAndDelete({ lectureId });
    }
    
    if (!result) {
      return NextResponse.json({ error: 'AI preference not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'AI preference deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI preference:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}