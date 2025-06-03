import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import AIPreference from '@/models/AIPreference';
import { verifyAuth } from '@/lib/auth';

// Add extracted content to AI preferences
export async function POST(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { lectureId, url, title, content, contentType = 'webpage', metadata = {} } = body;
    
    // Validation
    if (!lectureId || !url || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: lectureId, url, and content are required' 
      }, { status: 400 });
    }
    
    // Find or create AI preference for this lecture
    let aiPreference = await AIPreference.findOne({ lectureId });
    
    if (!aiPreference) {
      // Create new AI preference with default values
      aiPreference = new AIPreference({
        lectureId,
        model: 'Llama 3', // Default model
        temperature: 0.7,
        streaming: true,
        processingRules: {
          removeSensitiveData: true,
          allowUploads: true,
          formatText: true,
          removeHyperlinks: false,
          addCitations: false
        },
        systemPrompts: [],
        extractedContent: []
      });
    }
    
    // Create new extracted content entry
    const newExtractedContent = {
      url,
      title: title || 'Extracted Content',
      content,
      extractedAt: new Date(),
      contentType,
      metadata: {
        wordCount: content.split(/\s+/).length,
        language: metadata.language || 'en',
        encoding: metadata.encoding || 'UTF-8',
        ...metadata
      }
    };
    
    // Check if content from this URL already exists
    const existingIndex = aiPreference.extractedContent.findIndex(
      item => item.url === url
    );
    
    if (existingIndex !== -1) {
      // Update existing content
      aiPreference.extractedContent[existingIndex] = newExtractedContent;
    } else {
      // Add new content
      aiPreference.extractedContent.push(newExtractedContent);
    }
    
    // Update the accessUrl field to match the latest URL
    aiPreference.accessUrl = url;
    aiPreference.updatedAt = new Date();
    
    const saved = await aiPreference.save();
    
    return NextResponse.json({
      success: true,
      message: 'Extracted content added successfully',
      extractedContent: newExtractedContent,
      totalContentItems: saved.extractedContent.length
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error adding extracted content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get all extracted content for a lecture
export async function GET(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');
    
    if (!lectureId) {
      return NextResponse.json({ error: 'lectureId is required' }, { status: 400 });
    }
    
    const aiPreference = await AIPreference.findOne({ lectureId });
    
    if (!aiPreference) {
      return NextResponse.json({ 
        extractedContent: [],
        message: 'No AI preferences found for this lecture'
      });
    }
    
    return NextResponse.json({
      extractedContent: aiPreference.extractedContent || [],
      totalItems: aiPreference.extractedContent?.length || 0
    });
    
  } catch (error) {
    console.error('Error fetching extracted content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete specific extracted content by URL
export async function DELETE(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');
    const url = searchParams.get('url');
    const contentId = searchParams.get('contentId');
    
    if (!lectureId || (!url && !contentId)) {
      return NextResponse.json({ 
        error: 'lectureId and either url or contentId are required' 
      }, { status: 400 });
    }
    
    const aiPreference = await AIPreference.findOne({ lectureId });
    
    if (!aiPreference) {
      return NextResponse.json({ error: 'AI preference not found' }, { status: 404 });
    }
    
    let removedItem = null;
    
    if (contentId) {
      // Remove by MongoDB _id
      removedItem = aiPreference.extractedContent.id(contentId);
      if (removedItem) {
        aiPreference.extractedContent.pull(contentId);
      }
    } else {
      // Remove by URL
      const indexToRemove = aiPreference.extractedContent.findIndex(
        item => item.url === url
      );
      
      if (indexToRemove !== -1) {
        removedItem = aiPreference.extractedContent[indexToRemove];
        aiPreference.extractedContent.splice(indexToRemove, 1);
      }
    }
    
    if (!removedItem) {
      return NextResponse.json({ error: 'Extracted content not found' }, { status: 404 });
    }
    
    aiPreference.updatedAt = new Date();
    await aiPreference.save();
    
    return NextResponse.json({
      success: true,
      message: 'Extracted content deleted successfully',
      deletedItem: removedItem,
      remainingItems: aiPreference.extractedContent.length
    });
    
  } catch (error) {
    console.error('Error deleting extracted content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
