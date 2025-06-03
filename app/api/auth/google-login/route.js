import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';
import * as jose from 'jose';
import { jwtDecode } from 'jwt-decode';

export async function POST(request) {
  try {
    await connectDB();
    const { credential } = await request.json();
    
    // Add logging to help with debugging
    console.log("Google credential received:", !!credential);
    
    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential not provided' },
        { status: 400 }
      );
    }
    
    // Decode the credential to get user information
    try {
      const decodedToken = jwtDecode(credential);
      console.log("Token decoded successfully");
      
      const { email, name, picture, sub } = decodedToken;
      
      if (!email) {
        return NextResponse.json(
          { error: 'Email not provided by Google' },
          { status: 400 }
        );
      }
      
      // Find if user exists or create a new one
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create a new user
        user = new User({
          name: name || email.split('@')[0],
          email,
          // Generate a random secure password since the user will use Google to login
          password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
          profilePicture: picture,
          googleId: sub,
          isVerified: true, // Auto-verify users who sign up with Google
          role: 'professor' // Set default role
        });
        
        await user.save();
        console.log("New user created via Google auth:", email);
      } else if (!user.googleId) {
        // If user exists but doesn't have googleId, update it
        user.googleId = sub;
        user.isVerified = true;
        await user.save();
        console.log("Existing user updated with Google ID:", email);
      } else {
        console.log("Existing user logged in with Google:", email);
      }
      
      // Create JWT using jose
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
      const token = await new jose.SignJWT({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1d')
        .sign(secretKey);
      
      const userData = {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      // Create response
      const response = NextResponse.json({
        success: true,
        user: userData,
        token: token
      });
      
      // Set cookie
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 86400 // 1 day in seconds
      });
      
      return response;
    } catch (decodeError) {
      console.error("Failed to decode Google token:", decodeError);
      return NextResponse.json(
        { error: 'Invalid Google credential' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}