'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

function VerifyEmailContent() {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setError('No verification token found');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Email verified successfully!');
          router.push('/');
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError('An error occurred during verification');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {verifying ? (
            <h2 className="text-2xl font-bold text-yellow-500">
              Verifying your email...
            </h2>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <h2 className="text-2xl font-bold text-green-500">
              Email verified successfully!
            </h2>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading email verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
