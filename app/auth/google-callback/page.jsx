"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, getSession } from "next-auth/react";
import { toast } from "react-toastify";

export default function GoogleCallback() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Check URL for any error parameter from Google
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("error")) {
          toast.error(`Authentication failed: ${urlParams.get("error")}`);
          router.push("/login");
          return;
        }

        // Use session or getSession if not immediately available
        const currentSession = session || (await getSession());
        if (currentSession && currentSession.user) {
          localStorage.setItem("user", JSON.stringify(currentSession.user));
          toast.success("Google login successful");
          router.push("/dashboard");
        } else {
          toast.error("No active session received");
          router.push("/login");
        }
      } catch (err) {
        console.error("Google callback error:", err);
        toast.error("An error occurred during login");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      handleGoogleCallback();
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      {loading && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4" />
          <p className="text-lg">Completing Google Authentication...</p>
        </>
      )}
    </div>
  );
}