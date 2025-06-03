import { NextResponse } from 'next/server';
import * as jose from 'jose';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(req) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    try {
      const { payload } = await jose.jwtVerify(token, secretKey);
      
      // Check if user exists
      await connectDB();
      const user = await User.findById(payload.userId);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      // Token is valid, user exists
      return NextResponse.json({ valid: true, userId: user._id.toString() });
    } catch (error) {
      if (error.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}