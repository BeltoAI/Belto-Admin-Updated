// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const config = {
  matcher: ['/api/classes/:path*']
};

export async function middleware(request) {
  try {
    const token = request.cookies.get('token');
    
    if (!token || !token.value) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    try {
      // Create secret key bytes for jose
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
      
      // Verify token using jose
      const { payload } = await jwtVerify(token.value, secretKey);
      
      // Check role
      if (payload.role !== 'professor' && payload.role !== 'admin') {
        return NextResponse.json(
          { error: "Unauthorized - Professor access required" },
          { status: 403 }
        );
      }

      // Add user info to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user', JSON.stringify(payload));

      // Clone the request with new headers
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      return response;

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json(
      { error: "Middleware error" },
      { status: 500 }
    );
  }
}