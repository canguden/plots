"use client";

import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { useState } from "react";

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/signup?plan=starter';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier: 'starter' }),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        alert('Failed to start checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-[#999]">
            Start free. Upgrade when you grow. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="border border-[#222] bg-[#111] rounded-lg p-8">
            <div className="text-sm font-semibold text-[#666] uppercase tracking-wider mb-2">
              Free Forever
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              $0
              <span className="text-lg text-[#666] font-normal">/month</span>
            </div>
            <p className="text-[#999] mb-6">
              Perfect for side projects and personal sites
            </p>

            <Link
              href="/signup"
              className="block w-full text-center border border-[#222] text-white px-6 py-3 rounded-lg font-semibold hover:border-[#444] transition-colors mb-6"
            >
              Get Started Free
            </Link>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  <strong className="text-white">1,000 events/month</strong> included
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  1 project
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  Real-time analytics
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  Terminal dashboard (TUI)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  Privacy-first tracking
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  30 days data retention
                </span>
              </div>
            </div>
          </div>

          {/* Starter Tier */}
          <div className="border border-white bg-[#111] rounded-lg p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-xs font-semibold">
              MOST POPULAR
            </div>

            <div className="text-sm font-semibold text-[#666] uppercase tracking-wider mb-2">
              Starter
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              $9
              <span className="text-lg text-[#666] font-normal">/month</span>
            </div>
            <p className="text-[#999] mb-6">
              For growing businesses and production apps
            </p>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#eee] transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : user ? 'Upgrade Now' : 'Start 14-Day Trial'}
            </button>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  <strong className="text-white">10,000 events/month</strong> included
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  Unlimited projects
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  Real-time analytics
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  Terminal dashboard (TUI)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  Privacy-first tracking
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  <strong className="text-white">90 days</strong> data retention
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  Priority support
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white">✓</span>
                <span className="text-[#999]">
                  API access
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="border border-[#222] bg-[#111] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                What counts as an event?
              </h3>
              <p className="text-[#999]">
                Each pageview counts as one event. We don't count other events like clicks, 
                scrolls, or custom events against your limit.
              </p>
            </div>

            <div className="border border-[#222] bg-[#111] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-[#999]">
                Yes! Cancel anytime with one click. No questions asked. You'll be downgraded 
                to the free tier at the end of your billing period.
              </p>
            </div>

            <div className="border border-[#222] bg-[#111] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                What happens if I exceed my event limit?
              </h3>
              <p className="text-[#999]">
                We'll send you a notification when you reach 80% of your limit. If you exceed it, 
                we'll continue tracking but suggest upgrading to avoid service interruption.
              </p>
            </div>

            <div className="border border-[#222] bg-[#111] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-[#999]">
                Yes. If you're not satisfied within the first 30 days, we'll refund your payment 
                in full. No questions asked.
              </p>
            </div>

            <div className="border border-[#222] bg-[#111] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I self-host Plots?
              </h3>
              <p className="text-[#999]">
                Yes! Plots is open source. You can self-host it on your own infrastructure. 
                Check our GitHub repository for deployment instructions.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-[#999] mb-6">
            We're here to help. Reach out anytime.
          </p>
          <a
            href="mailto:support@plots.sh"
            className="inline-block border border-[#222] text-white px-6 py-3 rounded-lg font-semibold hover:border-[#444] transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
