"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';

interface Token {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used: string | null;
}

interface Usage {
  current: number;
  limit: number;
  percentage: number;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  useEffect(() => {
    loadTokens();
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usage`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  const loadTokens = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tokens`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || []);
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: 'CLI Token' }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewToken(data.token);
        await loadTokens();
      } else {
        alert('Failed to generate token');
      }
    } catch (error) {
      console.error('Failed to generate token:', error);
      alert('Failed to generate token');
    } finally {
      setGenerating(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this token?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tokens/${tokenId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        await loadTokens();
      } else {
        alert('Failed to revoke token');
      }
    } catch (error) {
      console.error('Failed to revoke token:', error);
      alert('Failed to revoke token');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Token copied to clipboard!');
    setNewToken(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-2">Settings</h1>
        <p className="text-sm text-[#666]">Manage your account and projects</p>
      </div>

      {/* Account Section */}
      <div className="border border-[#222] bg-[#111] rounded-lg">
        <div className="px-6 py-4 border-b border-[#222]">
          <h2 className="text-sm font-semibold text-white">Account</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-[#666] uppercase tracking-wider mb-2">
              Name
            </label>
            <input
              type="text"
              className="w-full bg-black border border-[#222] rounded px-4 py-2 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="Your name"
              value={user?.name || ''}
              disabled
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-black border border-[#222] rounded px-4 py-2 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="you@company.com"
              value={user?.email || ''}
              disabled
            />
            <p className="text-xs text-[#666] mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* API Tokens Section */}
      <div className="border border-[#222] bg-[#111] rounded-lg">
        <div className="px-6 py-4 border-b border-[#222]">
          <h2 className="text-sm font-semibold text-white">API Tokens</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-[#666] mb-4">
            Use API tokens to authenticate CLI and API requests. Run <code className="bg-black px-2 py-1 rounded">plots login</code> in your terminal.
          </p>

          {newToken && (
            <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4 mb-4">
              <div className="text-xs text-[#666] uppercase tracking-wider mb-2">
                New Token (copy now, won't be shown again)
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-white font-mono bg-black px-3 py-2 rounded overflow-x-auto">
                  {newToken}
                </code>
                <button
                  onClick={() => copyToClipboard(newToken)}
                  className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-[#eee] transition-colors whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <button
            onClick={generateToken}
            disabled={generating}
            className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-[#eee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating...' : 'Generate New Token'}
          </button>
          
          <div className="mt-6 space-y-2">
            <div className="text-xs text-[#666] uppercase tracking-wider mb-2">
              Active Tokens
            </div>
            {loading ? (
              <div className="text-sm text-[#666]">Loading...</div>
            ) : tokens.length === 0 ? (
              <div className="text-sm text-[#666]">No tokens yet</div>
            ) : (
              <div className="space-y-2">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between bg-black border border-[#222] rounded px-4 py-3"
                  >
                    <div>
                      <div className="text-sm text-white font-mono">{token.prefix}...</div>
                      <div className="text-xs text-[#666] mt-1">
                        Created {new Date(token.created_at).toLocaleDateString()}
                        {token.last_used && ` · Last used ${new Date(token.last_used).toLocaleDateString()}`}
                      </div>
                    </div>
                    <button
                      onClick={() => revokeToken(token.id)}
                      className="text-xs text-[#fb2c36] hover:text-[#ff4444] transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing Section */}
      <div className="border border-[#222] bg-[#111] rounded-lg">
        <div className="px-6 py-4 border-b border-[#222]">
          <h2 className="text-sm font-semibold text-white">Billing</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-white">
                {usage && usage.limit === 1000 ? 'Free Plan' : 
                 usage && usage.limit === 10000 ? 'Starter Plan' : 
                 'Pro Plan'}
              </div>
              <div className="text-xs text-[#666] mt-1">
                {usage ? `${usage.limit.toLocaleString()} events per month` : 'Loading...'}
              </div>
            </div>
            {usage && usage.limit === 1000 && (
              <a
                href="/pricing"
                className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-[#eee] transition-colors"
              >
                Upgrade
              </a>
            )}
          </div>
          {usage ? (
            <div className="bg-black border border-[#222] rounded-lg p-4">
              <div className="flex items-center justify-between text-xs text-[#666] mb-2">
                <span>Usage this month</span>
                <span>{usage.percentage}% of limit</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full" 
                  style={{ width: `${Math.min(usage.percentage, 100)}%` }} 
                />
              </div>
              <div className="text-xs text-[#666] mt-2">
                {usage.current.toLocaleString()} / {usage.limit.toLocaleString()} events used
              </div>
            </div>
          ) : (
            <div className="bg-black border border-[#222] rounded-lg p-4">
              <div className="text-sm text-[#666]">Loading usage...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
