"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";

function InstallBox() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'npm' | 'pnpm' | 'bun' | 'curl'>('npm');

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const installCommands = {
    npm: 'npm install -g plots',
    pnpm: 'pnpm install -g plots',
    bun: 'bun install -g plots',
    curl: 'curl -fsSL https://plots.app/install | bash',
  };

  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <div className="border border-[#333] bg-[#0a0a0a] rounded-lg overflow-hidden shadow-2xl">
        {/* Tabs */}
        <div className="bg-[#1a1a1a] border-b border-[#333] px-4 flex items-center gap-1">
          {(['npm', 'pnpm', 'bun', 'curl'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                ? 'text-white border-white'
                : 'text-[#666] border-transparent hover:text-white'
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Terminal Content */}
        <div className="p-6">
          <div className="bg-[#111] rounded px-4 py-3 flex items-center justify-between group border border-[#222] hover:border-[#444] transition-colors">
            <code className="text-sm text-white font-mono">$ {installCommands[activeTab]}</code>
            <button
              onClick={() => copyCode(installCommands[activeTab], 'install')}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#666] hover:text-white text-xs px-2 py-1 bg-[#1a1a1a] rounded"
            >
              {copied === 'install' ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-6 text-sm text-[#999]">
            <p className="mb-2">Then run plots to view your analytics:</p>
            <div className="bg-[#111] rounded px-4 py-3 flex items-center justify-between group border border-[#222] hover:border-[#444] transition-colors">
              <code className="text-white font-mono">$ plots</code>
              <button
                onClick={() => copyCode('plots', 'run')}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#666] hover:text-white text-xs px-2 py-1 bg-[#1a1a1a] rounded"
              >
                {copied === 'run' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#222]">
            <Link
              href="/docs"
              className="text-[#666] hover:text-white text-sm flex items-center gap-1"
            >
              <span>→</span> Read the full documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center  py-20">
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          Privacy-First Analytics<br />
          <span className="text-[#666]">Built for Developers</span>
        </h1>
        <p className="text-xl text-[#999] mb-8 max-w-2xl mx-auto">
          Simple, open-source, and privacy-focused web analytics.
          Track what matters without invading your users' privacy.
        </p>
        {!loading && (
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#eee] transition-colors"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#eee] transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="border border-[#222] text-white px-8 py-3 rounded-lg font-semibold hover:border-[#444] transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        )}

        {/* Installation Box */}
        <InstallBox />
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="border border-[#222] bg-[#111] rounded-lg p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Privacy First
            </h3>
            <p className="text-[#666]">
              No cookies, no tracking, no personal data collection.
              GDPR and CCPA compliant out of the box.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="border border-[#222] bg-[#111] rounded-lg p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-[#666]">
              &lt;1KB tracking script. Built with Bun and ClickHouse
              for real-time analytics at scale.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="border border-[#222] bg-[#111] rounded-lg p-6">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Terminal First
            </h3>
            <p className="text-[#666]">
              Beautiful TUI dashboard. View analytics without leaving
              your terminal with <code className="bg-black px-2 py-1 rounded">plots</code> CLI.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="max-w-4xl mx-auto py-20">
        <div className="border border-[#222] bg-[#111] rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Respect Your Users' Privacy
          </h2>
          <p className="text-lg text-[#999] mb-6 max-w-2xl mx-auto">
            We hash visitor IPs, don't use cookies, and never sell data.
            Your analytics belong to you, not surveillance capitalism.
          </p>
          <div className="space-y-2 text-sm text-[#666] max-w-xl mx-auto">
            <div>✓ No cookie banners needed</div>
            <div>✓ GDPR, CCPA, PECR compliant</div>
            <div>✓ Data ownership and control</div>
            <div>✓ Open source and transparent</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-[#999] mb-8">
          Free tier includes 1,000 events per month. No credit card required.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#eee] transition-colors"
        >
          Start Tracking Today
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#222] mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <pre className="text-xs leading-none text-white mb-4">
                {`█▀█ █   █▀█ ▀█▀ █▀
█▀▀ █▄▄ █▄█  █  ▄█`}
              </pre>
              <p className="text-sm text-[#666]">
                Privacy-first analytics
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-[#666]">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/signup" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-[#666]">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="https://github.com" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-[#666]">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#222] mt-8 pt-8 text-center text-sm text-[#666]">
            © {new Date().getFullYear()} Plots Analytics. Built with privacy in mind.
          </div>
        </div>
      </footer>
    </div>
  );
}
