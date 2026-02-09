"use client";

import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { useState } from "react";

const tiers = [
  {
    name: "Free",
    slug: "free",
    price: 0,
    description: "Perfect for side projects and personal sites",
    features: [
      { text: "1,000 events/month", highlight: true },
      { text: "1 website" },
      { text: "Real-time analytics" },
      { text: "Terminal dashboard (TUI)" },
      { text: "Privacy-first tracking" },
      { text: "30 days data retention" },
    ],
    cta: "Get Started Free",
    href: "/signup",
    popular: false,
    color: "#666",
  },
  {
    name: "Starter",
    slug: "starter",
    price: 9,
    description: "For growing businesses and production apps",
    features: [
      { text: "10,000 events/month", highlight: true },
      { text: "3 websites" },
      { text: "Real-time analytics" },
      { text: "Terminal dashboard (TUI)" },
      { text: "Privacy-first tracking" },
      { text: "90 days data retention", highlight: true },
      { text: "API access" },
      { text: "Email support" },
    ],
    cta: "Upgrade Now",
    popular: true,
    color: "#fff",
  },
  {
    name: "Pro",
    slug: "pro",
    price: 19,
    description: "For scaling products with serious traffic",
    features: [
      { text: "100,000 events/month", highlight: true },
      { text: "10 websites" },
      { text: "Real-time analytics" },
      { text: "Terminal dashboard (TUI)" },
      { text: "Privacy-first tracking" },
      { text: "1 year data retention", highlight: true },
      { text: "API access" },
      { text: "Priority support" },
    ],
    cta: "Upgrade Now",
    popular: false,
    color: "#a78bfa",
  },
  {
    name: "Business",
    slug: "business",
    price: 49,
    description: "For teams and high-traffic applications",
    features: [
      { text: "1,000,000 events/month", highlight: true },
      { text: "Unlimited websites" },
      { text: "Real-time analytics" },
      { text: "Terminal dashboard (TUI)" },
      { text: "Privacy-first tracking" },
      { text: "Unlimited data retention", highlight: true },
      { text: "API access" },
      { text: "Priority support" },
      { text: "Custom onboarding" },
    ],
    cta: "Upgrade Now",
    popular: false,
    color: "#f59e0b",
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleUpgrade = async (tier: string) => {
    if (!user) {
      window.location.href = `/signup?plan=${tier}`;
      return;
    }

    setLoadingTier(tier);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier }),
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
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block text-xs font-semibold text-[#999] uppercase tracking-wider bg-[#111] border border-[#222] rounded-full px-4 py-1.5 mb-6">
            Pricing
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-[#999] max-w-2xl mx-auto">
            Start free. Upgrade when you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.slug}
              className={`relative rounded-xl p-6 flex flex-col transition-all duration-200 ${tier.popular
                  ? 'bg-[#111] border-2 border-white shadow-[0_0_40px_rgba(255,255,255,0.05)]'
                  : 'bg-[#111] border border-[#222] hover:border-[#333]'
                }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-xs font-bold tracking-wider">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: tier.color }}>
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">
                    ${tier.price}
                  </span>
                  <span className="text-sm text-[#666]">/month</span>
                </div>
                <p className="text-sm text-[#999]">{tier.description}</p>
              </div>

              {/* CTA Button */}
              {tier.slug === 'free' ? (
                <Link
                  href={tier.href || '/signup'}
                  className="block w-full text-center border border-[#333] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:border-[#555] transition-colors mb-6"
                >
                  {tier.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier.slug)}
                  disabled={loadingTier === tier.slug}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed ${tier.popular
                      ? 'bg-white text-black hover:bg-[#eee]'
                      : 'border border-[#333] text-white hover:border-[#555] hover:bg-[#1a1a1a]'
                    }`}
                >
                  {loadingTier === tier.slug ? 'Redirecting...' : user ? tier.cta : `Start with ${tier.name}`}
                </button>
              )}

              {/* Features */}
              <div className="space-y-3 text-sm flex-1">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-white mt-0.5 text-xs">✓</span>
                    <span className={feature.highlight ? 'text-white font-medium' : 'text-[#999]'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-sm text-[#666]">
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
        <div className="max-w-3xl mx-auto mt-24">
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
                q: "Can I cancel anytime?",
                a: "Yes! Cancel with one click from your settings page. You'll keep your current plan until the end of the billing period.",
              },
              {
                q: "What happens if I exceed my event limit?",
                a: "We'll keep tracking your events and send you a notification. No data is lost — just upgrade to a higher plan to continue uninterrupted.",
              },
              {
                q: "Can I switch plans mid-cycle?",
                a: "Yes. Upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle.",
              },
              {
                q: "Do you offer annual billing?",
                a: "Not yet, but it's coming soon with a 20% discount. All current plans are billed monthly.",
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
