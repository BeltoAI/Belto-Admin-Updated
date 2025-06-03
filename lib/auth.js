import { cookies } from 'next/headers';
import * as jose from 'jose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function verifyAuth(request) {
  // First try to get session from NextAuth
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      userId: session.user.userId,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
    };
  }

  // If no session, try from cookies
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    // Also try from Authorization header as fallback
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const tokenFromHeader = authHeader.substring(7);
      return verifyToken(tokenFromHeader);
    }
    return null;
  }

  return verifyToken(token);
}

async function verifyToken(token) {
  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}