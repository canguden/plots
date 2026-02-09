"use client";

import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { useState } from "react";

const proLevels = [
  { events: 10_000, price: 10, label: "10K", tier: "pro_10k" },
  { events: 50_000, price: 20, label: "50K", tier: "pro_50k" },
  { events: 100_000, price: 30, label: "100K", tier: "pro_100k" },
  { events: 500_000, price: 50, label: "500K", tier: "pro_500k" },
  { events: 1_000_000, price: 80, label: "1M", tier: "pro_1m" },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [loading, setLoading] = useState(false);

  const level = proLevels[selectedLevel];

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = `/signup?plan=${level.tier}`;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier: level.tier }),
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
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block text-xs font-semibold text-[#999] uppercase tracking-wider bg-[#111] border border-[#222] rounded-full px-4 py-1.5 mb-6">
            Pricing
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Plots Grows With You
          </h1>
          <p className="text-xl text-[#999] max-w-2xl mx-auto">
            Start free. Slide to the level that fits your traffic. No complex tiers, no surprise bills.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20">

          {/* Free Plan */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-8 flex flex-col">
            <div className="mb-6">
              <div className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-3">Free</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-sm text-[#666]">/month</span>
              </div>
              <p className="text-sm text-[#999]">Perfect for side projects</p>
            </div>

            <Link
              href="/signup"
              className="block w-full text-center border border-[#333] text-white px-4 py-3 rounded-lg text-sm font-semibold hover:border-[#555] transition-colors mb-8"
            >
              Get Started Free
            </Link>

            <div className="space-y-3 text-sm flex-1">
              {[
                { text: "1,000 events/month", highlight: true },
                { text: "1 website" },
                { text: "Real-time analytics" },
                { text: "Terminal dashboard (TUI)" },
                { text: "Privacy-first tracking" },
                { text: "30 days data retention" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-white mt-0.5 text-xs">✓</span>
                  <span className={f.highlight ? 'text-white font-medium' : 'text-[#999]'}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan with Slider */}
          <div className="bg-[#111] border-2 border-white rounded-xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(255,255,255,0.05)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-xs font-bold tracking-wider">
              RECOMMENDED
            </div>

            <div className="mb-6">
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Pro</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-white">${level.price}</span>
                <span className="text-sm text-[#666]">/month</span>
              </div>
              <p className="text-sm text-[#999]">
                <span className="text-white font-medium">{level.label}</span> events per month
              </p>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <input
                type="range"
                min={0}
                max={proLevels.length - 1}
                step={1}
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-[#333] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.3)]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:border-none
                  [&::-moz-range-thumb]:cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                {proLevels.map((l, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedLevel(i)}
                    className={`text-xs transition-colors ${i === selectedLevel ? 'text-white font-semibold' : 'text-[#666] hover:text-[#999]'
                      }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-white text-black px-4 py-3 rounded-lg text-sm font-semibold hover:bg-[#eee] transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting...' : user ? `Upgrade to Pro — ${level.label}` : 'Start with Pro'}
            </button>

            <div className="space-y-3 text-sm flex-1">
              {[
                { text: `${level.label} events/month`, highlight: true },
                { text: "Unlimited websites" },
                { text: "Real-time analytics" },
                { text: "Terminal dashboard (TUI)" },
                { text: "Privacy-first tracking" },
                { text: "1 year data retention", highlight: true },
                { text: "API access" },
                { text: "Priority support" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-white mt-0.5 text-xs">✓</span>
                  <span className={f.highlight ? 'text-white font-medium' : 'text-[#999]'}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#666] mb-20">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>Setup in 30 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <span>↩️</span>
            <span>Cancel anytime</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "What counts as an event?",
                a: "Each pageview counts as one event. We don't count clicks, scrolls, or other interactions against your limit.",
              },
              {
                q: "Can I change my plan later?",
                a: "Yes! Slide up or down anytime from your settings. Upgrades take effect immediately, downgrades at the next billing cycle.",
              },
              {
                q: "What happens if I exceed my event limit?",
                a: "We'll keep tracking your events and send you a notification. No data is lost — just slide up to a higher level to continue uninterrupted.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes! Cancel with one click from your settings page. You'll keep your current plan until the end of the billing period.",
              },
              {
                q: "Can I self-host Plots?",
                a: "Yes! Plots is open source. You can self-host it on your own infrastructure. Check our GitHub repository for deployment instructions.",
              },
            ].map((faq, i) => (
              <details key={i} className="group border border-[#222] bg-[#111] rounded-lg">
                <summary className="px-6 py-4 cursor-pointer text-white font-medium hover:bg-[#1a1a1a] transition-colors rounded-lg flex items-center justify-between">
                  {faq.q}
                  <span className="text-[#666] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-4 text-[#999]">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-24">
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
