import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/dbConnect';
import { sendResetPasswordEmail } from '@/utils/email'; // Changed import
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Generate a random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Handle POST request (send reset email)
export async function POST(request) {
    await connectDB();

    try {
        const { email } = await request.json();

        const user = await User.findOne({ email, role: { $in: ['admin', 'professor'] } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const resetToken = generateToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Use the new sendResetPasswordEmail function
        await sendResetPasswordEmail(user.email, resetToken);

        return NextResponse.json({ message: 'Password reset email sent' }, { status: 200 });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
    }
}

// Handle PUT request (update password)
export async function PUT(request) {
    await connectDB();

    try {
        const { token, password } = await request.json();

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
            role: { $in: ['admin', 'professor'] }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
    }
}

// Handle other methods (optional)
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}