import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GeneralFeedback from '@/models/GeneralFeedback';

// GET: Fetch all general feedbacks
export async function GET(request) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    
    // Count total documents for pagination
    const total = await GeneralFeedback.countDocuments(query);
    
    // Fetch feedbacks with pagination
    const generalFeedbacks = await GeneralFeedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({ 
      generalFeedbacks,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new general feedback
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['email', 'q1_helpfulness', 'q2_frustrations', 'q3_improvement'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    // Create new feedback
    const newFeedback = await GeneralFeedback.create({
      email: body.email,
      q1_helpfulness: body.q1_helpfulness,
      q2_frustrations: body.q2_frustrations,
      q3_improvement: body.q3_improvement
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Feedback submitted successfully',
      feedback: newFeedback 
    }, { status: 201 });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}