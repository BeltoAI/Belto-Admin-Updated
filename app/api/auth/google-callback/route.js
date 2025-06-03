import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  try {
    // Get session information from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // For Google sign-in, we'll need to confirm this user in our backend
    // to get a proper authentication token for our API
    const backendResponse = await axios.post(
      process.env.NEXT_PUBLIC_API_URL + "/api/auth/google-login",
      {
        email: session.user.email,
        name: session.user.name,
        picture: session.user.image,
        // Include any other necessary fields your backend needs
      }
    );
    
    // Format of response depends on your API implementation
    const { token, user } = backendResponse.data;
    
    // Set cookies for frontend use
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    
    // Set HTTP-only cookies for security
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });
    
    // Also set a localStorage flag via a non-http-only cookie
    // that the client can use to detect login state
    response.cookies.set({
      name: "userLoggedIn",
      value: "true",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=GoogleAuthFailed", request.url)
    );
  }
}