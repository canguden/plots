"use client";

import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#222] bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-white">plots</span>
            <span className="text-[#666]">/</span>
            <span className="text-[#666]">docs</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="text-[#666] hover:text-white text-sm">
              Login
            </Link>
            <Link href="/signup" className="bg-white text-black px-4 py-2 rounded text-sm font-semibold hover:bg-[#eee] transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <nav className="md:col-span-1">
          <div className="sticky top-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-3">
                Getting Started
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#installation" className="text-white hover:text-[#999]">Installation</a></li>
                <li><a href="#quick-start" className="text-[#666] hover:text-white">Quick Start</a></li>
                <li><a href="#authentication" className="text-[#666] hover:text-white">Authentication</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-3">
                Integration
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#web-tracking" className="text-[#666] hover:text-white">Web Tracking</a></li>
                <li><a href="#api" className="text-[#666] hover:text-white">API Reference</a></li>
                <li><a href="#cli" className="text-[#666] hover:text-white">CLI Usage</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-3">
                Features
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#privacy" className="text-[#666] hover:text-white">Privacy</a></li>
                <li><a href="#billing" className="text-[#666] hover:text-white">Billing & Plans</a></li>
                <li><a href="#self-hosting" className="text-[#666] hover:text-white">Self-Hosting</a></li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="md:col-span-3 space-y-12">
          {/* Installation */}
          <section id="installation">
            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-[#999] mb-8">
              Everything you need to integrate privacy-first analytics into your projects.
            </p>

            <h2 className="text-2xl font-bold mb-4">Installation</h2>
            <p className="text-[#999] mb-4">
              Get started with Plots using our CLI tool powered by OpenTUI:
            </p>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-[#222]">
                <span className="text-xs text-[#666]">Terminal</span>
                <button
                  onClick={() => copyCode("npx opentui plots", "install")}
                  className="text-xs text-[#666] hover:text-white"
                >
                  {copiedSection === "install" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-[#0f0]">$ npx opentui plots</code>
              </pre>
            </div>

            <p className="text-[#999] mt-4">
              This will launch an interactive TUI to set up your analytics tracking.
            </p>
          </section>

          {/* Quick Start */}
          <section id="quick-start">
            <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
            <p className="text-[#999] mb-4">
              Add the tracking script to your website:
            </p>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-[#222]">
                <span className="text-xs text-[#666]">HTML</span>
                <button
                  onClick={() => copyCode('<script defer data-domain="yourdomain.com" src="https://plots.app/js/script.js"></script>', "script")}
                  className="text-xs text-[#666] hover:text-white"
                >
                  {copiedSection === "script" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-[#0f0]">{`<script defer
  data-domain="yourdomain.com"
  src="https://plots.app/js/script.js">
</script>`}</code>
              </pre>
            </div>

            <div className="mt-6 bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-2xl">ℹ️</div>
                <div>
                  <h4 className="font-semibold mb-1">Script Size: &lt;1KB</h4>
                  <p className="text-sm text-[#999]">
                    Our tracking script is lightweight and won't impact your page load times.
                    It's smaller than Google Analytics and respects Do Not Track.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication">
            <h2 className="text-2xl font-bold mb-4">Authentication</h2>
            <p className="text-[#999] mb-4">
              Sign up for a free account to get your tracking domain:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#1a1a1a] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-[#333]">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Create an account</h4>
                  <p className="text-sm text-[#999]">Sign up at <Link href="/signup" className="text-white hover:underline">plots.app/signup</Link></p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-[#1a1a1a] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-[#333]">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Add your domain</h4>
                  <p className="text-sm text-[#999]">Register the domains you want to track</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-[#1a1a1a] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-[#333]">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Install the script</h4>
                  <p className="text-sm text-[#999]">Copy the tracking code and add it to your site's &lt;head&gt; tag</p>
                </div>
              </div>
            </div>
          </section>

          {/* Web Tracking */}
          <section id="web-tracking">
            <h2 className="text-2xl font-bold mb-4">Web Tracking</h2>
            <p className="text-[#999] mb-4">
              Plots automatically tracks page views, but you can also track custom events:
            </p>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-[#222]">
                <span className="text-xs text-[#666]">JavaScript</span>
                <button
                  onClick={() => copyCode('window.plausible("signup", { props: { plan: "starter" } });', "custom-event")}
                  className="text-xs text-[#666] hover:text-white"
                >
                  {copiedSection === "custom-event" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-[#0f0]">{`// Track custom events
window.plausible("signup", {
  props: { plan: "starter" }
});

// Track outbound links
window.plausible("Outbound Link: Click", {
  props: { url: "https://example.com" }
});`}</code>
              </pre>
            </div>
          </section>

          {/* CLI Usage */}
          <section id="cli">
            <h2 className="text-2xl font-bold mb-4">CLI Usage</h2>
            <p className="text-[#999] mb-4">
              View your analytics from the terminal:
            </p>

            <div className="space-y-4">
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
                <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#222]">
                  <span className="text-xs text-[#666]">View dashboard</span>
                </div>
                <pre className="p-4">
                  <code className="text-sm text-[#0f0]">$ plots dashboard</code>
                </pre>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
                <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#222]">
                  <span className="text-xs text-[#666]">Check API key</span>
                </div>
                <pre className="p-4">
                  <code className="text-sm text-[#0f0]">$ plots auth login</code>
                </pre>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
                <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#222]">
                  <span className="text-xs text-[#666]">Export data</span>
                </div>
                <pre className="p-4">
                  <code className="text-sm text-[#0f0]">$ plots export --format csv --output analytics.csv</code>
                </pre>
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section id="api">
            <h2 className="text-2xl font-bold mb-4">API Reference</h2>
            <p className="text-[#999] mb-4">
              Access your analytics data programmatically:
            </p>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-[#222]">
                <span className="text-xs text-[#666]">GET /api/events</span>
                <button
                  onClick={() => copyCode('curl -H "Authorization: Bearer YOUR_API_KEY" https://plots.app/api/events', "api")}
                  className="text-xs text-[#666] hover:text-white"
                >
                  {copiedSection === "api" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-[#0f0]">{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://plots.app/api/events`}</code>
              </pre>
            </div>

            <div className="mt-4 text-sm text-[#999]">
              <p className="mb-2">Authentication is done via Bearer token in the Authorization header.</p>
              <p>Get your API key from your dashboard settings.</p>
            </div>
          </section>

          {/* Privacy */}
          <section id="privacy">
            <h2 className="text-2xl font-bold mb-4">Privacy Features</h2>
            <div className="space-y-4">
              <div className="border border-[#222] bg-[#0a0a0a] rounded-lg p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  IP Address Hashing
                </h3>
                <p className="text-sm text-[#999]">
                  We hash all IP addresses before storing them. Once hashed, the original IP cannot be recovered.
                </p>
              </div>

              <div className="border border-[#222] bg-[#0a0a0a] rounded-lg p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-2xl">🍪</span>
                  No Cookies
                </h3>
                <p className="text-sm text-[#999]">
                  We don't use cookies at all. No cookie banners needed, and you stay GDPR compliant.
                </p>
              </div>

              <div className="border border-[#222] bg-[#0a0a0a] rounded-lg p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-2xl">🚫</span>
                  Respects Do Not Track
                </h3>
                <p className="text-sm text-[#999]">
                  Our script automatically respects the Do Not Track browser setting.
                </p>
              </div>
            </div>
          </section>

          {/* Billing */}
          <section id="billing">
            <h2 className="text-2xl font-bold mb-4">Billing & Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#222] bg-[#0a0a0a] rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="text-3xl font-bold mb-4">$0<span className="text-sm text-[#666]">/mo</span></div>
                <ul className="space-y-2 text-sm text-[#999]">
                  <li>✓ 1,000 events/month</li>
                  <li>✓ Unlimited domains</li>
                  <li>✓ Basic analytics</li>
                  <li>✓ 30-day data retention</li>
                </ul>
              </div>

              <div className="border border-[#444] bg-[#0a0a0a] rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-3xl font-bold mb-4">$9<span className="text-sm text-[#666]">/mo</span></div>
                <ul className="space-y-2 text-sm text-[#999]">
                  <li>✓ 10,000 events/month</li>
                  <li>✓ Unlimited domains</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Unlimited data retention</li>
                  <li>✓ API access</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Self-Hosting */}
          <section id="self-hosting">
            <h2 className="text-2xl font-bold mb-4">Self-Hosting</h2>
            <p className="text-[#999] mb-4">
              Plots is open source and can be self-hosted:
            </p>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-[#222]">
                <span className="text-xs text-[#666]">Docker</span>
                <button
                  onClick={() => copyCode('docker run -p 3000:3000 plots/analytics', "docker")}
                  className="text-xs text-[#666] hover:text-white"
                >
                  {copiedSection === "docker" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-[#0f0]">{`# Run with Docker
docker run -p 3000:3000 plots/analytics

# Or clone and run locally
git clone https://github.com/yourusername/plots
cd plots
bun install
bun dev`}</code>
              </pre>
            </div>

            <div className="mt-6 bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-2xl">⚙️</div>
                <div>
                  <h4 className="font-semibold mb-1">Requirements</h4>
                  <p className="text-sm text-[#999]">
                    Node.js 18+, Bun 1.0+, ClickHouse 22+
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <div className="border-t border-[#222] pt-12 mt-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-[#999] mb-6">
                Start tracking your analytics in under 5 minutes.
              </p>
              <Link
                href="/signup"
                className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#eee] transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
