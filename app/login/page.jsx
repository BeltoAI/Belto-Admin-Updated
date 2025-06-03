"use client";

import { Mail, Eye, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    // Use a hardcoded client ID as a fallback if the environment variable is missing
    // The string is from your .env.local file
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
                         "122580096237-9312jkesk3inqhhikg6qasnjpjharrop.apps.googleusercontent.com";
    
    console.log("Google Client ID length:", googleClientId?.length || 0);

    // Check if user is already logged in
    useEffect(() => {
        // Check for token in localStorage or cookies
        const token = localStorage.getItem('token') || 
                      document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
        
        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    const handleContinue = async (e) => {
        e.preventDefault();

        if (step === 1) {
            if (!email) {
                toast.error('Email is required');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!password) {
                toast.error('Password is required');
                return;
            }
            
            try {
                setLoading(true);
                setError('');

                // Direct API call to your login endpoint
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.error || 'Invalid credentials');
                    setError(data.error || 'Invalid email or password');
                    return;
                }

                // Save token to localStorage for persistence
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    // Store user data if needed
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                    toast.success('Login successful');
                    router.push('/dashboard');
                } else {
                    setError('Something went wrong');
                    toast.error('Authentication failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                setError('An error occurred. Please try again.');
                toast.error('Login failed');
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle Google Sign In
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            setError('');
            
            console.log("Google credential received:", !!credentialResponse.credential);
            
            // Send the credential to your backend
            const response = await fetch('/api/auth/google-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    credential: credentialResponse.credential 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || 'Google sign-in failed');
                setError(data.error || 'Google authentication failed');
                return;
            }

            // Save token to localStorage for persistence
            if (data.token) {
                localStorage.setItem('token', data.token);
                // Store user data if needed
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                toast.success('Login successful');
                router.push('/dashboard');
            } else {
                setError('Something went wrong');
                toast.error('Authentication failed');
            }
        } catch (error) {
            console.error('Google login error:', error);
            setError('An error occurred. Please try again.');
            toast.error('Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = (error) => {
        console.error("Google Sign-In Error:", error);
        toast.error('Google sign-in was canceled or failed');
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

                {/* Form section */}
                <form onSubmit={handleContinue} className="space-y-4 md:space-y-6">
                    {step === 1 && (
                        <>
                            {/* Email field */}
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
                                {loading ? 'Processing...' : 'Continue'}
                                <ArrowRight className="h-5 w-5 ml-2 text-black" />
                            </button>

                            {/* Divider */}
                            <div className="flex items-center my-4">
                                <hr className="flex-grow border-gray-700" />
                                <span className="px-3 text-xs text-gray-500 uppercase">or</span>
                                <hr className="flex-grow border-gray-700" />
                            </div>

                            {/* Google Sign-in Button */}
                            <div>
                                {googleClientId ? (
                                    <GoogleOAuthProvider clientId={googleClientId}>
                                        <div className="w-full flex justify-center">
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                                useOneTap
                                                theme="filled_black"
                                                text="signin_with"
                                                shape="rectangular"
                                                locale="en"
                                                logo_alignment="left"
                                            />
                                        </div>
                                    </GoogleOAuthProvider>
                                ) : (
                                    <div className="text-red-500 text-center py-3">
                                        Google Sign-In is currently unavailable.
                                    </div>
                                )}
                            </div>

                            {/* Custom Google button as fallback */}
                            {!googleClientId && (
                                <div>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 border border-gray-800 rounded-md flex items-center justify-center gap-2 md:gap-4 bg-gray-900 text-sm md:text-base transition-colors opacity-50 cursor-not-allowed"
                                        disabled={true}
                                    >
                                        <FcGoogle className="w-5 h-5 flex-shrink-0" />
                                        <span>Google Sign-In Unavailable</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Step 2 of login form */}
                    {step === 2 && (
                        <>
                            {/* Display selected email */}
                            <div className="space-y-1 border border-yellow-600 p-3 md:p-4 rounded-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm md:text-base text-gray-400 truncate">{email}</span>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-xs md:text-sm text-yellow-500 hover:text-yellow-400 whitespace-nowrap"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            {/* Password field */}
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
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <Eye className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}

                            {/* Forgot password link */}
                            <div className="flex justify-end">
                                <Link 
                                    href="/reset-password" 
                                    className="text-yellow-500 hover:text-yellow-400 text-sm md:text-base"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                className="flex justify-center items-center w-full py-2 md:py-3 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-yellow-500 text-sm md:text-base transition-colors"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                                <ArrowRight className="h-5 w-5 ml-2 text-black" />
                            </button>
                        </>
                    )}
                </form>

                {/* Register link */}
                <div className="text-center">
                    <span className="text-gray-400 text-sm md:text-base">Don&apos;t have an account? </span>
                    <Link
                        href="/register"
                        className="text-yellow-500 hover:text-yellow-400 text-sm md:text-base"
                    >
                        Register
                    </Link>
                </div>

                {/* Terms and Privacy Links */}
                <div className="flex items-center justify-center space-x-4 text-xs md:text-sm text-gray-500">
                    <a 
                        href="https://belto.world/terms.html" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-gray-400 transition-colors"
                    >
                        Terms of Use
                    </a>
                    <a 
                        href="https://belto.world/privacy.html" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-gray-400 transition-colors"
                    >
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
}