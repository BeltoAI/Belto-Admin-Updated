import { NextResponse } from 'next/server';
import { retrieveRelevantContent, formatContextForPrompt } from '@/lib/rag-service';
import { verifyAuth } from '@/lib/auth';

/**
 * RAG (Retrieval-Augmented Generation) API endpoint
 * Retrieves relevant content based on user query and lecture context
 */
export async function POST(request) {
  try {
    // Verify user authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, lectureId, maxResults = 3, format = 'raw' } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!lectureId) {
      return NextResponse.json({ error: 'Lecture ID is required' }, { status: 400 });
    }

    console.log(`RAG API: Processing query "${query}" for lecture ${lectureId}`);

    // Retrieve relevant content
    const relevantContent = await retrieveRelevantContent(query, lectureId, maxResults);

    // Format response based on requested format
    let response;
    if (format === 'formatted') {
      // Return formatted context ready for prompt injection
      response = {
        success: true,
        formattedContext: formatContextForPrompt(relevantContent),
        contentCount: relevantContent.length,
        sources: relevantContent.map(item => ({
          source: item.source,
          sourceInfo: item.sourceInfo,
          similarity: item.similarity
        }))
      };
    } else {
      // Return raw content with metadata
      response = {
        success: true,
        content: relevantContent,
        contentCount: relevantContent.length,
        query: query,
        lectureId: lectureId
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('RAG API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve relevant content', details: error.message }, 
      { status: 500 }
    );
  }
}


