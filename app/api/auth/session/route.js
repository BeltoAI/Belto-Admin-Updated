import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function GET(request) {
    try {
        // Updated: correct way to use getServerSession in App Router
        const session = await getServerSession(authOptions);
        
        if (session) {
            return NextResponse.json(session);
        } else {
            return NextResponse.json(
                { error: "No active session" },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Session error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}