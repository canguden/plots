"use client";

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <pre className="text-sm leading-none text-white inline-block">
{`█▀█ █   █▀█ ▀█▀ █▀
█▀▀ █▄▄ █▄█  █  ▄█`}
          </pre>
          <p className="text-[#666] text-sm mt-4">Privacy-first analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="border border-[#222] bg-[#111] rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-[#460809] border border-[#82181a] text-[#fb2c36] px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#666] uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-[#222] rounded px-4 py-2 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="you@company.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs text-[#666] uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-[#222] rounded px-4 py-2 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-2 rounded font-medium hover:bg-[#eee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-sm">
            <span className="text-[#666]">Don't have an account? </span>
            <a href="/signup" className="text-white hover:underline">
              Sign up
            </a>
          </div>
        </form>

        <div className="text-center text-xs text-[#666] mt-6">
          <a href="/" className="hover:text-white transition-colors">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
