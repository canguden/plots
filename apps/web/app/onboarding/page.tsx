"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function OnboardingPage() {
  const [websiteName, setWebsiteName] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.plots.sh';
      const response = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: websiteName,
          domain: domain,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const project = await response.json();
      setProjectId(project.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const copyScript = () => {
    const script = `<script defer src="https://plots.sh/plots.js" data-project="${projectId}"></script>`;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (projectId) {
    return (
      <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              🎉 Your site is ready!
            </h1>
            <p className="text-[#666] text-sm">
              Now install the tracking script on your website
            </p>
          </div>

          <div className="border border-[#222] bg-[#111] rounded-lg p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm text-white font-medium">Installation</h2>
                <span className="text-xs text-[#666]">Step 1 of 1</span>
              </div>
              <p className="text-sm text-[#999] mb-4">
                Add this script before the closing <code className="text-white bg-black px-1 py-0.5 rounded">&lt;/head&gt;</code> tag of your website:
              </p>
              
              <div className="bg-black border border-[#222] rounded-lg p-4 relative group">
                <pre className="text-sm text-white overflow-x-auto">
{`<script
  defer
  src="https://plots.sh/plots.js"
  data-project="${projectId}"
></script>`}
                </pre>
                <button
                  onClick={copyScript}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-[#1a1a1a] hover:bg-[#222] text-white px-3 py-1.5 rounded"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-xl">💡</div>
                <div>
                  <h3 className="text-sm text-white font-medium mb-1">What happens next?</h3>
                  <ul className="text-xs text-[#999] space-y-1">
                    <li>• The script is lightweight (~1KB) and won't slow down your site</li>
                    <li>• It's privacy-friendly and doesn't use cookies</li>
                    <li>• Data will appear in your dashboard within seconds of your first visitor</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-white text-black py-2 rounded font-medium hover:bg-[#eee] transition-colors"
              >
                Go to Dashboard →
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="px-6 bg-[#1a1a1a] text-white py-2 rounded font-medium hover:bg-[#222] transition-colors border border-[#333]"
              >
                Add Another Site
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://github.com/canguden/plots#installation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#666] hover:text-white transition-colors"
            >
              View installation guide for different platforms →
            </a>
          </div>
        </div>
      </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <pre className="text-sm leading-none text-white inline-block">
{`█▀█ █   █▀█ ▀█▀ █▀
█▀▀ █▄▄ █▄█  █  ▄█`}
          </pre>
          <h1 className="text-2xl font-semibold text-white mt-6 mb-2">
            Welcome to Plots!
          </h1>
          <p className="text-[#666] text-sm">
            Let's set up analytics for your website
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border border-[#222] bg-[#111] rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-[#460809] border border-[#82181a] text-[#fb2c36] px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#666] uppercase tracking-wider mb-2">
              Website Name
            </label>
            <input
              type="text"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              className="w-full bg-black border border-[#222] rounded px-4 py-2 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="My Awesome Site"
              required
              disabled={loading}
            />
            <p className="text-xs text-[#666] mt-2">
              A friendly name to identify this project
            </p>
          </div>

          <div>
            <label className="block text-xs text-[#666] uppercase tracking-wider mb-2">
              Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-black border border-[#222] rounded px-4 py-2 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="example.com"
              required
              disabled={loading}
            />
            <p className="text-xs text-[#666] mt-2">
              Your website's domain (without https://)
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#222] rounded p-4">
            <div className="text-xs text-[#666] mb-2">
              After setup, add this script to your website:
            </div>
            <pre className="text-xs text-white overflow-x-auto">
{`<script
  defer
  src="https://plots.sh/plots.js"
  data-project="[YOUR-PROJECT-ID]"
></script>`}
            </pre>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-2 rounded font-medium hover:bg-[#eee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Create Project'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#666]">
            You can add more projects later from your dashboard
          </p>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
