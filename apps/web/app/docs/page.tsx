"use client";

import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [installTab, setInstallTab] = useState<'npm' | 'pnpm' | 'bun' | 'curl'>('npm');

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const installCommands = {
    npm: 'npm install -g plots',
    pnpm: 'pnpm install -g plots',
    bun: 'bun install -g plots',
    curl: 'curl -fsSL https://plots.app/install | bash',
  };

  return (
    <div className="min-h-screen text-white">

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
              Install the Plots CLI to access your analytics from the terminal:
            </p>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <div className="bg-[#1a1a1a] border-b border-[#333] px-4 flex items-center gap-1">
                {(['npm', 'pnpm', 'bun', 'curl'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInstallTab(tab)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${installTab === tab
                        ? 'text-white border-white'
                        : 'text-[#666] border-transparent hover:text-white'
                      }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="p-4 flex items-center justify-between group">
                <code className="text-sm text-white font-mono">$ {installCommands[installTab]}</code>
                <button
                  onClick={() => copyCode(installCommands[installTab], "install")}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#666] hover:text-white text-xs px-2 py-1 bg-[#1a1a1a] rounded"
                >
                  {copiedSection === "install" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <p className="text-[#999] mt-4">
              Once installed, run <code className="bg-[#1a1a1a] px-2 py-0.5 rounded text-white">plots</code> in your terminal to access your dashboard.
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
                <code className="text-sm text-white">{`<script defer
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

          {/* Authentication & Integration */}
          <section id="authentication">
            <h2 className="text-2xl font-bold mb-4">Authentication & Integration</h2>
            <p className="text-[#999] mb-6">
              There are two primary ways to use Plots: via our web script for site analytics, or via our CLI for developer-centric insights and data management.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#222] bg-[#0a0a0a] rounded-lg p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">🌐</span> Web Integration
                </h3>
                <ol className="space-y-3 text-sm text-[#999] list-decimal list-inside">
                  <li>Create an account at <Link href="/signup" className="text-white hover:underline">plots.sh/signup</Link></li>
                  <li>Add your domain in the settings dashboard</li>
                  <li>Copy the tracking script into your site's <code className="text-white">&lt;head&gt;</code></li>
                </ol>
              </div>

              <div className="border border-[#222] bg-[#0a0a0a] rounded-lg p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">💻</span> CLI Integration
                </h3>
                <ol className="space-y-3 text-sm text-[#999] list-decimal list-inside">
                  <li>Install the CLI: <code className="text-white">npm install -g plots</code></li>
                  <li>Authenticate: <code className="text-white">plots login</code></li>
                  <li>Run <code className="text-white">plots</code> to open the terminal dashboard</li>
                </ol>
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
                <code className="text-sm text-white">{`// Track custom events
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
                  <code className="text-sm text-white">$ plots dashboard</code>
                </pre>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
                <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#222]">
                  <span className="text-xs text-[#666]">Authenticate CLI</span>
                </div>
                <pre className="p-4">
                  <code className="text-sm text-white">$ plots login</code>
                </pre>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
                <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#222]">
                  <span className="text-xs text-[#666]">Export data</span>
                </div>
                <pre className="p-4">
                  <code className="text-sm text-white">$ plots export --format csv --output analytics.csv</code>
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
                <code className="text-sm text-white">{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
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
            <p className="text-[#999] mb-8">
              Plots uses a "grows with you" pricing model. Start free and scale up as your traffic increases.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-[#222] bg-[#0a0a0a] rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Forever Free</h3>
                <div className="text-3xl font-bold mb-4">$0<span className="text-sm text-[#666]">/mo</span></div>
                <ul className="space-y-2 text-sm text-[#999]">
                  <li>✓ 1,000 events/month</li>
                  <li>✓ 1 website project</li>
                  <li>✓ Basic analytics (TUI + Web)</li>
                  <li>✓ 30-day data retention</li>
                </ul>
              </div>

              <div className="border-2 border-white bg-[#0a0a0a] rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-[10px] font-bold tracking-wider">
                  RECOMMENDED
                </div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-4">From $10<span className="text-sm text-[#666]">/mo</span></div>
                <ul className="space-y-2 text-sm text-[#999]">
                  <li>✓ Selective event limits (10K to 1M+)</li>
                  <li>✓ Unlimited website projects</li>
                  <li>✓ 1-year data retention</li>
                  <li>✓ API & Priority support</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-xl p-8">
              <h4 className="text-lg font-bold mb-4 text-center">Interactive Slider Pricing</h4>
              <p className="text-sm text-[#666] text-center mb-6">
                Slide to the level that fits your needs on our <Link href="/pricing" className="text-white underline">pricing page</Link>.
              </p>
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-[#999]">10,000 events</span>
                  <span className="text-white">$10/mo</span>
                </div>
                <div className="w-full h-1.5 bg-[#333] rounded-full relative">
                  <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#999]">100,000 events</span>
                  <span className="text-white">$30/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#999]">1,000,000 events</span>
                  <span className="text-white">$80/mo</span>
                </div>
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
                <code className="text-sm text-white">{`# Run with Docker
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
