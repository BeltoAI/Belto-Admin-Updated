import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import SystemPrompt from '@/models/SystemPrompt';

// DELETE a system prompt by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const deletedPrompt = await SystemPrompt.findByIdAndDelete(id);
    
    if (!deletedPrompt) {
      return NextResponse.json({ error: 'System prompt not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'System prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting system prompt:', error);
    return NextResponse.json({ error: 'Failed to delete system prompt' }, { status: 500 });
  }
}