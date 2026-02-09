"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CliAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userCode = searchParams.get("user_code");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userCode) {
      setStatus("error");
      setMessage("Missing verification code. Please try logging in again from your CLI.");
      return;
    }

    async function authorize() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.plots.sh";
        
        // Call the authorization endpoint
        const response = await fetch(`${apiUrl}/cli/device/authorize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Include session cookie
          body: JSON.stringify({ user_code: userCode }),
        });

        if (response.ok) {
          setStatus("success");
          setMessage("Successfully authorized! You can close this window and return to your terminal.");
        } else {
          const error = await response.json();
          setStatus("error");
          
          if (response.status === 401) {
            setMessage("You must be logged in to authorize CLI access.");
            setTimeout(() => router.push(`/login?redirect=/cli-auth?user_code=${userCode}`), 2000);
          } else if (error.error === "invalid_code") {
            setMessage("Invalid or expired verification code. Please try logging in again from your CLI.");
          } else {
            setMessage(error.error || "Authorization failed. Please try again.");
          }
        }
      } catch (error) {
        setStatus("error");
        setMessage("Network error. Please check your connection and try again.");
        console.error("Authorization error:", error);
      }
    }

    authorize();
  }, [userCode, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authorizing CLI Access</h1>
              <p className="text-gray-600">Please wait while we verify your request...</p>
            </>
          )}
          
          {status === "success" && (
            <>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Verification code: <code className="bg-gray-100 px-2 py-1 rounded">{userCode}</code></p>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authorization Failed</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CliAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <CliAuthContent />
    </Suspense>
  );
}
