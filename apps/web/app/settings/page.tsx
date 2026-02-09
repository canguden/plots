"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

interface Token {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used: string | null;
}

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface Usage {
  current: number;
  limit: number;
  percentage: number;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDomain, setNewProjectDomain] = useState('');
  const [addingProject, setAddingProject] = useState(false);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    loadTokens();
    loadUsage();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.plots.sh';
      const res = await fetch(`${apiUrl}/api/projects`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingProject(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.plots.sh';
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newProjectName,
          domain: newProjectDomain,
        }),
      });

      if (res.ok) {
        await loadProjects();
        setShowAddProject(false);
        setNewProjectName('');
        setNewProjectDomain('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add project');
      }
    } catch (error) {
      console.error('Failed to add project:', error);
      alert('Failed to add project');
    } finally {
      setAddingProject(false);
    }
  };

  const copyScript = (projectId: string) => {
    const script = `<script defer src="https://api.plots.sh/plots.js" data-project="${projectId}"></script>`;
    navigator.clipboard.writeText(script);
    setCopiedScript(projectId);
    setTimeout(() => setCopiedScript(null), 2000);
  };

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
      setLoadingData(false);
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

  // Show loading while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-[#666]">Loading...</p>
        </div>
      </div>
    );
  }

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

      {/* Projects Section */}
      <div className="border border-[#222] bg-[#111] rounded-lg">
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Websites</h2>
          <button
            onClick={() => setShowAddProject(!showAddProject)}
            className="text-xs bg-white text-black px-3 py-1.5 rounded font-medium hover:bg-[#eee] transition-colors"
          >
            {showAddProject ? 'Cancel' : '+ Add Website'}
          </button>
        </div>
        <div className="p-6">
          {showAddProject && (
            <form onSubmit={addProject} className="mb-6 p-4 bg-[#0a0a0a] border border-[#333] rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#666] uppercase tracking-wider mb-2">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full bg-black border border-[#222] rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-white transition-colors"
                    placeholder="My Awesome Site"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666] uppercase tracking-wider mb-2">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={newProjectDomain}
                    onChange={(e) => setNewProjectDomain(e.target.value)}
                    className="w-full bg-black border border-[#222] rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-white transition-colors"
                    placeholder="example.com"
                    required
                  />
                  <p className="text-xs text-[#666] mt-1">
                    Your website's domain (without https://)
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={addingProject}
                  className="w-full bg-white text-black py-2 rounded font-medium hover:bg-[#eee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingProject ? 'Adding...' : 'Add Website'}
                </button>
              </div>
            </form>
          )}

          {projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🌐</div>
              <p className="text-sm text-[#666]">No websites yet. Add your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-white">{project.name}</div>
                      <div className="text-xs text-[#666] mt-0.5">{project.domain}</div>
                    </div>
                    <div className="text-xs text-[#666]">
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <details className="text-sm">
                    <summary className="text-[#666] hover:text-white cursor-pointer mb-2">
                      Show tracking script
                    </summary>
                    <div className="bg-black border border-[#222] rounded p-3 relative group mt-2">
                      <pre className="text-xs text-white overflow-x-auto pr-16">
                        {`<script
  defer
  src="https://api.plots.sh/plots.js"
  data-project="${project.id}"
></script>`}
                      </pre>
                      <button
                        onClick={() => copyScript(project.id)}
                        className="absolute top-2 right-2 text-xs bg-[#1a1a1a] hover:bg-[#222] text-white px-3 py-1.5 rounded transition-colors"
                      >
                        {copiedScript === project.id ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-[#666] mt-2">
                      Add this before the closing &lt;/head&gt; tag
                    </p>
                  </details>
                </div>
              ))}
            </div>
          )}
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
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Billing & Usage</h2>
          {usage && usage.limit > 1000 && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/portal`, {
                    method: 'POST',
                    credentials: 'include',
                  });
                  if (res.ok) {
                    const data = await res.json();
                    window.location.href = data.url;
                  } else {
                    alert('Unable to open subscription management');
                  }
                } catch (e) {
                  alert('Unable to open subscription management');
                }
              }}
              className="text-xs bg-[#1a1a1a] text-white px-3 py-1.5 rounded border border-[#333] hover:border-[#555] transition-colors"
            >
              Manage Subscription
            </button>
          )}
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {usage && usage.limit > 1000
                    ? `Pro Plan — ${usage.limit.toLocaleString()} events`
                    : 'Free Plan'}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${usage && usage.limit > 1000
                  ? 'bg-white/10 text-white'
                  : 'bg-[#222] text-[#666]'
                  }`}>
                  {usage && usage.limit > 1000 ? 'PRO' : 'FREE'}
                </span>
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
                  className={`h-2 rounded-full transition-all ${usage.percentage > 90 ? 'bg-red-500' :
                    usage.percentage > 70 ? 'bg-yellow-500' :
                      'bg-white'
                    }`}
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
          {usage && usage.limit === 1000 && (
            <div className="text-xs text-[#666]">
              Need more events? <a href="/pricing" className="text-white hover:underline">Compare plans →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
