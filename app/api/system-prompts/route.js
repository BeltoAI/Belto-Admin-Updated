import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import SystemPrompt from '@/models/SystemPrompt';

// GET all system prompts for a lecture
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');

    if (!lectureId) {
      return NextResponse.json({ error: 'Lecture ID is required' }, { status: 400 });
    }

    await connectDB();
    const prompts = await SystemPrompt.find({ lectureId }).sort({ createdAt: 1 });
    
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching system prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch system prompts' }, { status: 500 });
  }
}

// POST a new system prompt
export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.lectureId || !data.name || !data.content) {
      return NextResponse.json({ error: 'Lecture ID, name, and content are required' }, { status: 400 });
    }

    await connectDB();
    
    // Check for duplicates
    const existingPrompt = await SystemPrompt.findOne({ 
      lectureId: data.lectureId, 
      name: data.name 
    });
    
    if (existingPrompt) {
      return NextResponse.json({ 
        error: 'A prompt with this name already exists for this lecture' 
      }, { status: 409 });
    }

    const newPrompt = new SystemPrompt(data);
    await newPrompt.save();
    
    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error('Error creating system prompt:', error);
    return NextResponse.json({ error: 'Failed to create system prompt' }, { status: 500 });
  }
}

// PUT (update) an existing system prompt
export async function PUT(request) {
  try {
    const data = await request.json();
    
    if (!data._id || !data.name || !data.content) {
      return NextResponse.json({ error: 'Prompt ID, name, and content are required' }, { status: 400 });
    }

    await connectDB();
    
    // Find and update the prompt
    const updatedPrompt = await SystemPrompt.findByIdAndUpdate(
      data._id,
      { 
        name: data.name, 
        content: data.content,
        updatedAt: Date.now() 
      },
      { new: true }
    );
    
    if (!updatedPrompt) {
      return NextResponse.json({ error: 'System prompt not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating system prompt:', error);
    return NextResponse.json({ error: 'Failed to update system prompt' }, { status: 500 });
  }
}