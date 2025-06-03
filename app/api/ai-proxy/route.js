import { NextResponse } from 'next/server';
import axios from 'axios';
import { Readable } from 'stream';
import connectDB from '@/lib/dbConnect';
import AIPreference from '@/models/AIPreference';
import { retrieveRelevantContent, formatContextForPrompt } from '@/lib/rag-service';

export async function POST(request) {
  console.log('POST request received');

  try {
    const body = await request.json();
    console.log('Request body:', body);

    // Get API key from environment variables
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      throw new Error('AI API key is not configured');
    }

    // Check for lectureId to apply preferences
    const lectureId = body.lectureId;
    if (lectureId) {
      try {
        await connectDB();
        const preferences = await AIPreference.findOne({ lectureId });
        
        if (preferences) {
          console.log('Found preferences for lecture:', lectureId);
          
          // Apply model preference if available
          if (preferences.model) {
            // Map our UI model names to API model names if needed
            const modelMap = {
              "Llama 3": "llama3",
              "Zypher 7B": "zypher",
              "ChatGPT 3.5": "gpt-3.5-turbo"
            };
            
            body.model = modelMap[preferences.model] || preferences.model;
          }
          
          // Apply temperature
          if (preferences.temperature !== undefined) {
            body.temperature = preferences.temperature;
          }
          
          // Apply max tokens
          if (preferences.maxTokens) {
            body.max_tokens = preferences.maxTokens;
          }
            // Apply system prompt if not already specified
          if (preferences.systemPrompts && preferences.systemPrompts.length > 0 && 
              (!body.messages || !body.messages.some(msg => msg.role === 'system'))) {
            
            // Insert system prompt at the beginning of messages
            const systemMessage = {
              role: 'system',
              content: preferences.systemPrompts[0].content
            };
            
            body.messages = body.messages ? [systemMessage, ...body.messages] : [systemMessage];
          }
          
          // Apply streaming preference
          body.stream = preferences.streaming !== undefined ? preferences.streaming : body.stream;
          
          console.log('Applied preferences to request:', body);
        }
      } catch (dbError) {
        console.error('Error fetching preferences:', dbError);
        // Continue with request even if preferences fetch fails
      }
    }

    // RAG (Retrieval-Augmented Generation) Integration
    // Retrieve relevant content from lecture materials and inject into context
    if (lectureId && body.messages && body.messages.length > 0) {
      try {
        // Get the user's latest message to use as query for RAG
        const userMessages = body.messages.filter(msg => msg.role === 'user');
        const latestUserMessage = userMessages[userMessages.length - 1];
        
        if (latestUserMessage && latestUserMessage.content) {
          console.log('RAG: Retrieving relevant content for user query...');
            // Retrieve relevant content using RAG service
          const relevantContent = await retrieveRelevantContent(
            latestUserMessage.content, 
            lectureId, 
            5 // max results - increased to accommodate uploaded files + URL content + lecture materials
          );
          
          if (relevantContent && relevantContent.length > 0) {
            console.log(`RAG: Found ${relevantContent.length} relevant content chunks`);
            
            // Format the context for injection
            const ragContext = formatContextForPrompt(relevantContent);
            
            // Inject RAG context into the user's message
            latestUserMessage.content = latestUserMessage.content + ragContext;
            
            console.log('RAG: Context successfully injected into user message');
          } else {
            console.log('RAG: No relevant content found for this query');
          }
        }
      } catch (ragError) {
        console.error('RAG Error (continuing without context):', ragError);
        // Continue with request even if RAG fails
      }    }

    // Set a custom timeout (e.g., 60 seconds)
    const timeout = 60000; // 60 seconds in milliseconds

    // Handle streaming and non-streaming responses differently
    if (body.stream) {
      // Make request with axios but get raw response
      const response = await axios.post(
        'http://belto.myftp.biz:9999/v1/chat/completions', 
        body, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: timeout,
          responseType: 'stream',
        }
      );

      // Create response headers
      const headers = new Headers();
      headers.set('Content-Type', 'text/event-stream');
      headers.set('Cache-Control', 'no-cache');
      headers.set('Connection', 'keep-alive');
      
      // Convert axios response stream to Web API readable stream
      const stream = new ReadableStream({
        start(controller) {
          let lastChunk = '';
          let finalData = null;
          
          // Handle data chunks
          response.data.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            lastChunk = chunkStr;
            controller.enqueue(new Uint8Array(chunk));
          });
          
          // Handle end of stream - append usage data if available
          response.data.on('end', () => {
            // Try to parse the last chunk to get token usage
            try {
              if (lastChunk && lastChunk.includes('data: [DONE]')) {
                // Find the last actual data chunk before [DONE]
                const parts = lastChunk.split('data:');
                let usageData = null;
                
                for (let i = parts.length - 2; i >= 0; i--) {
                  if (parts[i] && parts[i].trim() !== '[DONE]') {
                    try {
                      const jsonData = JSON.parse(parts[i].trim());
                      if (jsonData.usage) {
                        usageData = jsonData.usage;
                        break;
                      }
                    } catch (e) {
                      // Skip this part if it's not valid JSON
                    }
                  }
                }
                
                if (usageData) {
                  // Send the usage data as a separate event
                  const usageEvent = `data: ${JSON.stringify({ usage: usageData })}\n\n`;
                  controller.enqueue(new TextEncoder().encode(usageEvent));
                }
              }
            } catch (e) {
              console.error('Error parsing final chunk:', e);
            }
            
            controller.close();
          });
          
          // Handle errors
          response.data.on('error', (err) => {
            console.error('Stream error:', err);
            controller.error(err);
          });
        },
        
        // Cancel the axios request if the stream is cancelled
        cancel() {
          response.data.destroy();
        }
      });
      // Return a streaming response
      return new Response(stream, { headers });
    } else {
      // Non-streaming request
      const response = await axios.post(
        'http://belto.myftp.biz:9999/v1/chat/completions', 
        body, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: timeout,
          responseType: 'json',
        }
      );

      return NextResponse.json(response.data);
    }
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });

    return NextResponse.json(
      { error: `Error: ${error.message}` },
      { status: error.response?.status || 500 }
    );
  }
}

export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200 });
}