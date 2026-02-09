"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Small delay to let webhook process
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-lg mx-auto text-center px-4">
                {loading ? (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-6"></div>
                        <p className="text-[#999]">Setting up your account...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-6xl mb-6">🎉</div>
                        <h1 className="text-3xl font-bold text-white mb-3">
                            Welcome to Plots!
                        </h1>
                        <p className="text-[#999] mb-8">
                            Your subscription is now active. Your new limits are ready to go.
                        </p>

                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-8 text-left space-y-3">
                            <div className="text-sm text-[#999]">What's unlocked:</div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-400">✓</span>
                                <span className="text-white">Higher event limits</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-400">✓</span>
                                <span className="text-white">More websites</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-400">✓</span>
                                <span className="text-white">Extended data retention</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-400">✓</span>
                                <span className="text-white">Priority support</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/dashboard"
                                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#eee] transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                            <Link
                                href="/settings"
                                className="border border-[#333] text-white px-6 py-3 rounded-lg font-semibold hover:border-[#555] transition-colors"
                            >
                                View Settings
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
