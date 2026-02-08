"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [websiteName, setWebsiteName] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/projects', {
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

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
