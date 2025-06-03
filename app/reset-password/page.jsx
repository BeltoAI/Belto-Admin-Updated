"use client";

import { Mail, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Email is required');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/auth/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
                toast.success('Password reset instructions sent to your email');
            } else {
                toast.error(data.error || 'Failed to send reset instructions');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = () => {
        handleResetPassword({ preventDefault: () => {} });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-4">
                {/* Logo */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 md:gap-4">
                    <Image
                        width={400}
                        height={400}
                        src="/logo.png"
                        alt="Logo"
                        className="rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32"
                    />
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
                        ADMIN PORTAL
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl text-center font-medium">
                    {emailSent ? 'Check Your Email' : 'Reset your password'}
                </h2>

                {/* Description */}
                <p className="text-center text-gray-400 text-sm">
                    {emailSent 
                        ? `Please check the email address ${email} for instructions to reset your password.`
                        : 'Provide your email address to receive instructions for resetting your password.'}
                </p>

                {/* Form */}
                {!emailSent ? (
                    <form onSubmit={handleResetPassword} className="space-y-8">
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                className="w-full px-3 py-2 md:px-4 md:py-3 bg-transparent border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm md:text-base peer"
                                placeholder=" "
                            />
                            <label
                                htmlFor="email"
                                className={`absolute left-3 text-sm md:text-base transition-all duration-200 transform 
                                    ${emailFocused || email ? '-translate-y-2 text-xs md:text-sm text-yellow-500 bg-black px-1' : 'translate-y-2 text-gray-500'}
                                    pointer-events-none
                                `}
                            >
                                Email address
                            </label>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="flex justify-center items-center w-full py-2 md:py-3 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-yellow-500 text-sm md:text-base transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Continue'}
                            <ArrowRight className="h-5 w-5 ml-2 text-black" />
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={handleResendEmail}
                        className="w-full px-3 py-2 md:py-3 border border-gray-800 rounded-md text-sm md:text-base hover:bg-gray-900 transition-colors"
                    >
                        Resend Email
                    </button>
                )}

                {/* Back to Login Link */}
                <div className="flex items-center justify-center mt-8 md:mt-12">
                    <Link 
                        href="/login" 
                        className="text-yellow-500 hover:text-yellow-400 text-sm md:text-base"
                    >
                        Back to Sign In
                    </Link>
                </div>

                {/* Terms and Privacy Links */}
                <div className="flex items-center justify-center space-x-4 text-xs md:text-sm text-gray-500">
                    <Link href="/terms" className="hover:text-gray-400 transition-colors">
                        Terms of Use
                    </Link>
                    <Link href="/privacy" className="hover:text-gray-400 transition-colors">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
}