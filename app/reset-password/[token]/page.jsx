"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage({ params }) {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
    
    // Access token directly from params
    const token = params.token;

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        // Form validation
        if (!password) {
            toast.error('Password is required');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/auth/admin/reset-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password reset successfully');
                router.push('/login');
            } else {
                toast.error(data.error || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
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

                <h2 className="text-2xl text-center font-medium">
                    Create New Password
                </h2>

                <p className="text-center text-gray-400 text-sm">
                    Enter a new password for your account.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-8">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            className="w-full px-3 py-2 md:px-4 md:py-3 bg-transparent border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm md:text-base peer"
                            placeholder=" "
                        />
                        <label
                            htmlFor="password"
                            className={`absolute left-3 text-sm md:text-base transition-all duration-200 transform 
                                ${passwordFocused || password ? '-translate-y-2 text-xs md:text-sm text-yellow-500 bg-black px-1' : 'translate-y-2 text-gray-500'}
                                pointer-events-none
                            `}
                        >
                            New Password
                        </label>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-500"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setConfirmPasswordFocused(true)}
                            onBlur={() => setConfirmPasswordFocused(false)}
                            className="w-full px-3 py-2 md:px-4 md:py-3 bg-transparent border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm md:text-base peer"
                            placeholder=" "
                        />
                        <label
                            htmlFor="confirmPassword"
                            className={`absolute left-3 text-sm md:text-base transition-all duration-200 transform 
                                ${confirmPasswordFocused || confirmPassword ? '-translate-y-2 text-xs md:text-sm text-yellow-500 bg-black px-1' : 'translate-y-2 text-gray-500'}
                                pointer-events-none
                            `}
                        >
                            Confirm Password
                        </label>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-500"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="flex justify-center items-center w-full py-2 md:py-3 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-yellow-500 text-sm md:text-base transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                        <ArrowRight className="h-5 w-5 ml-2 text-black" />
                    </button>
                </form>

                <div className="flex items-center justify-center mt-8 md:mt-12">
                    <Link 
                        href="/login" 
                        className="text-yellow-500 hover:text-yellow-400 text-sm md:text-base"
                    >
                        Back to Sign In
                    </Link>
                </div>

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