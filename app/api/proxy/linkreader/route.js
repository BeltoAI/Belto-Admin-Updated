import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const url = body.url;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    console.log('Server proxy: Extracting content from URL:', url);
    
    const response = await fetch('http://linkreader.api.beltoss.com/read_link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': '123456789012345'
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('API error:', response.status, errorText);
      return NextResponse.json(
        { error: `API error (${response.status}): ${errorText || response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('API response received successfully');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in linkreader proxy:', error);
    return NextResponse.json(
      { error: `Failed to extract content: ${error.message}` },
      { status: 500 }
    );
  }
}