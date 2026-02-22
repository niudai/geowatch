'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface App {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
}

interface Keyword {
  id: string;
  appId: string;
  keyword: string;
  status: string;
  lastCheckedAt: string | null;
  createdAt: string;
}

interface MonitoringResult {
  id: string;
  appId: string;
  keywordId: string;
  source: 'google_ai_mode' | 'chatgpt';
  queryText: string;
  aiResponse: string;
  mentionedInResponse: boolean;
  sentiment: string;
  mentionText: string | null;
  createdAt: string;
}

export default function AppDetailContent({ params }: { params: Promise<{ appId: string }> }) {
  const [appId, setAppId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [app, setApp] = useState<App | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [results, setResults] = useState<MonitoringResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');
  const [monitoring, setMonitoring] = useState(false);

  // Extract appId from params promise
  useEffect(() => {
    params.then((p) => setAppId(p.appId));
  }, [params]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && appId) {
      fetchAppData();
    }
  }, [status, appId]);

  async function fetchAppData() {
    if (!appId) return;
    try {
      // Fetch app details
      const appRes = await fetch(`/api/apps`);
      const allApps = await appRes.json();
      const currentApp = allApps.find((a: App) => a.id === appId);
      setApp(currentApp || null);

      // Fetch keywords
      const keywordsRes = await fetch(`/api/apps/${appId}/keywords`);
      const keywordsData = await keywordsRes.json();
      setKeywords(keywordsData);

      // Fetch recent monitoring results
      const resultsRes = await fetch(`/api/apps/${appId}/results`);
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setResults(resultsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch app data:', error);
      setLoading(false);
    }
  }

  async function addKeyword() {
    if (!newKeyword.trim() || !appId) return;

    try {
      const res = await fetch(`/api/apps/${appId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword }),
      });

      const newKw = await res.json();
      setKeywords([...keywords, newKw]);
      setNewKeyword('');
    } catch (error) {
      console.error('Failed to add keyword:', error);
    }
  }

  async function runMonitoring() {
    if (!appId) return;
    setMonitoring(true);
    try {
      const res = await fetch(`/api/apps/${appId}/run-monitoring`, {
        method: 'POST',
      });

      if (res.ok) {
        // Refetch results after monitoring completes
        await new Promise((r) => setTimeout(r, 2000)); // Wait a bit for results to be saved
        await fetchAppData();
      }
    } catch (error) {
      console.error('Failed to run monitoring:', error);
    } finally {
      setMonitoring(false);
    }
  }

  if (status === 'loading' || loading || !appId) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">App not found</p>
          <Link href="/dashboard" className="text-cyan-500 hover:text-cyan-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-cyan-500 hover:text-cyan-400 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">{app.name}</h1>
          <p className="text-gray-400">Monitor your brand in AI search results</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={runMonitoring}
            disabled={monitoring || keywords.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {monitoring ? 'Monitoring...' : 'Run Monitoring'}
          </button>
        </div>

        {/* Keywords Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Keywords</h2>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Add a keyword (e.g., GeoWatch, AI SEO)"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              className="flex-1 px-4 py-2 rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={addKeyword}
              className="px-6 py-2 bg-slate-700 rounded hover:bg-slate-600 transition font-semibold"
            >
              Add
            </button>
          </div>

          {keywords.length === 0 ? (
            <p className="text-gray-400 py-4">No keywords yet. Add one to get started!</p>
          ) : (
            <div className="space-y-2">
              {keywords.map((kw) => (
                <div
                  key={kw.id}
                  className="bg-slate-700 rounded p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{kw.keyword}</p>
                    <p className="text-xs text-gray-400">
                      Last checked:{' '}
                      {kw.lastCheckedAt ? new Date(kw.lastCheckedAt).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    {kw.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Results</h2>
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No monitoring results yet. Run monitoring to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {result.source === 'google_ai_mode' ? '🔍 Google AI Mode' : '💬 ChatGPT'}
                      </h3>
                      <p className="text-sm text-gray-400">Query: {result.queryText}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          result.mentionedInResponse
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {result.mentionedInResponse ? '✓ Mentioned' : '✗ Not Mentioned'}
                      </span>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(result.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded p-3 mb-4 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-300">{result.aiResponse.substring(0, 500)}</p>
                    {result.aiResponse.length > 500 && (
                      <p className="text-xs text-gray-500 mt-2">... (truncated)</p>
                    )}
                  </div>

                  {result.mentionedInResponse && result.mentionText && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
                      <p className="text-xs text-cyan-400 font-semibold mb-1">Mention Context:</p>
                      <p className="text-sm text-cyan-50">{result.mentionText}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
