'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { useSubscription } from '@/hooks/useSubscription';

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

interface LinkItem {
  text: string;
  url: string;
  domain?: string;
}

interface CitationItem {
  text: string;
  urls: string[];
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
  citations: string | CitationItem[] | null;
  links: string | LinkItem[] | null;
  createdAt: string;
}

// Parse JSON field that may be a string or already parsed
function parseJsonField<T>(field: string | T[] | null | undefined): T[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Highlight brand name in AI response text
function HighlightedResponse({ text, brandName }: { text: string; brandName: string }) {
  if (!text || !brandName) return <span>{text}</span>;

  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();
  const parts: { text: string; highlight: boolean }[] = [];
  let lastIndex = 0;

  let searchFrom = 0;
  while (searchFrom < lowerText.length) {
    const idx = lowerText.indexOf(lowerBrand, searchFrom);
    if (idx === -1) break;
    if (idx > lastIndex) {
      parts.push({ text: text.slice(lastIndex, idx), highlight: false });
    }
    parts.push({ text: text.slice(idx, idx + brandName.length), highlight: true });
    lastIndex = idx + brandName.length;
    searchFrom = lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }

  if (parts.length === 0) return <span>{text}</span>;

  return (
    <>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark key={i} className="bg-cyan-500/20 text-cyan-300 px-0.5 rounded">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}

// Collapsible citations list
function CitationsList({ links, citations }: { links: LinkItem[]; citations: CitationItem[] }) {
  const [expanded, setExpanded] = useState(false);

  // Merge links from both sources
  const allLinks = useMemo(() => {
    const seen = new Set<string>();
    const merged: LinkItem[] = [];

    for (const link of links) {
      if (link.url && !seen.has(link.url)) {
        seen.add(link.url);
        merged.push(link);
      }
    }

    for (const cit of citations) {
      for (const url of cit.urls || []) {
        if (!seen.has(url)) {
          seen.add(url);
          try {
            const domain = new URL(url).hostname;
            merged.push({ text: cit.text || domain, url, domain });
          } catch {}
        }
      }
    }

    return merged;
  }, [links, citations]);

  if (allLinks.length === 0) {
    return <p className="text-xs text-white/40 mt-3">No cited sources</p>;
  }

  const visibleLinks = expanded ? allLinks : allLinks.slice(0, 3);

  return (
    <div className="mt-3 border-t border-zinc-700/40 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs font-medium text-white/50 hover:text-white/70 transition flex items-center gap-1.5 mb-2"
      >
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Cited Sources ({allLinks.length})
      </button>

      <div className="space-y-1.5">
        {visibleLinks.map((link, i) => {
          let domain = link.domain || '';
          if (!domain) {
            try { domain = new URL(link.url).hostname; } catch {}
          }
          return (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 transition group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                alt=""
                width={14}
                height={14}
                className="rounded-sm opacity-60 group-hover:opacity-100"
              />
              <span className="text-white/50 shrink-0">{domain}</span>
              <span className="truncate">{link.text || link.url}</span>
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 shrink-0 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          );
        })}
      </div>

      {!expanded && allLinks.length > 3 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-cyan-400/70 hover:text-cyan-400 mt-1.5 transition"
        >
          +{allLinks.length - 3} more
        </button>
      )}
    </div>
  );
}

// Confirm delete modal
function ConfirmDeleteModal({
  open,
  keyword,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  keyword: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-zinc-900 border border-zinc-700/60 rounded-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-white text-center mb-2">Delete Keyword</h3>
        <p className="text-sm text-white/55 text-center mb-2">
          Are you sure you want to delete this keyword?
        </p>
        <p className="text-sm text-white/80 text-center bg-zinc-800 border border-zinc-700/40 rounded-lg px-3 py-2 mb-4 break-words">
          &ldquo;{keyword}&rdquo;
        </p>
        <p className="text-xs text-red-400/70 text-center mb-6">
          All monitoring results for this keyword will also be deleted. This cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700/60 text-white/70 hover:text-white hover:bg-zinc-700 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:text-red-300 transition text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Source result card
function SourceCard({
  result,
  brandName,
  onViewFull,
}: {
  result: MonitoringResult;
  brandName: string;
  onViewFull: (result: MonitoringResult) => void;
}) {
  const isGoogle = result.source === 'google_ai_mode';
  const links = parseJsonField<LinkItem>(result.links);
  const citations = parseJsonField<CitationItem>(result.citations);
  const responsePreview = result.aiResponse?.substring(0, 600) || '';
  const isTruncated = result.aiResponse?.length > 600;

  return (
    <div className="bg-zinc-900 border border-zinc-700/60 rounded-lg overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-700/40">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              isGoogle
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-purple-500/15 text-purple-400'
            }`}
          >
            {isGoogle ? 'Google AI Mode' : 'ChatGPT'}
          </span>
          <span className="text-xs text-white/40">
            {new Date(result.createdAt).toLocaleString()}
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
            result.mentionedInResponse
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-red-500/15 text-red-400'
          }`}
        >
          {result.mentionedInResponse ? '\u2713 Mentioned' : '\u2717 Not Mentioned'}
        </span>
      </div>

      {/* AI Response */}
      <div className="px-4 py-3">
        <div className="text-sm text-white/65 leading-relaxed max-h-40 overflow-y-auto">
          <HighlightedResponse text={responsePreview} brandName={brandName} />
          {isTruncated && (
            <button
              onClick={() => onViewFull(result)}
              className="text-cyan-400/70 hover:text-cyan-400 transition ml-1"
            >
              ... Click to view full response
            </button>
          )}
        </div>

        {/* Citations */}
        <CitationsList links={links} citations={citations} />
      </div>
    </div>
  );
}

// Paywall banner for non-subscribers
function PaywallBanner({ hasUsedTrial }: { hasUsedTrial: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(plan: 'pro' | 'business') {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create checkout session.');
        setLoading(null);
        return;
      }
      if (!data.url) {
        setError('No checkout URL returned. Please try again.');
        setLoading(null);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Network error. Please try again.');
      setLoading(null);
    }
  }

  return (
    <div className="mb-8 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-900/20 via-zinc-900 to-cyan-900/20 p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-semibold text-white">Start monitoring your brand</h3>
          </div>
          <p className="text-sm text-white/55 mb-1">
            Subscribe to track your brand visibility across AI search engines.
          </p>
          {!hasUsedTrial && (
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[11px] font-medium text-emerald-400">
              3-day free trial included
            </span>
          )}
          {error && (
            <p className="text-sm text-red-400 mt-2">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleClick('pro')}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition text-sm disabled:opacity-50"
          >
            {loading === 'pro' ? 'Redirecting...' : 'Start Free Trial \u2014 Pro $49/mo'}
          </button>
          <button
            onClick={() => handleClick('business')}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition text-sm disabled:opacity-50"
          >
            {loading === 'business' ? 'Redirecting...' : 'Business $199/mo'}
          </button>
        </div>
      </div>
    </div>
  );
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
  const [modalResult, setModalResult] = useState<MonitoringResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Keyword | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { subscription, loading: subLoading } = useSubscription();

  const isSubscribed = !subLoading && subscription?.plan !== 'free' &&
    (subscription?.status === 'active' || subscription?.status === 'trialing');

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
      const appRes = await fetch(`/api/apps`);
      const allApps = await appRes.json();
      const currentApp = allApps.find((a: App) => a.id === appId);
      setApp(currentApp || null);

      const keywordsRes = await fetch(`/api/apps/${appId}/keywords`);
      const keywordsData = await keywordsRes.json();
      setKeywords(keywordsData);

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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      setKeywords([...keywords, data]);
      setNewKeyword('');
    } catch (error) {
      console.error('Failed to add keyword:', error);
    }
  }

  async function confirmDeleteKeyword() {
    if (!appId || !deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/apps/${appId}/keywords`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywordId: deleteTarget.id }),
      });
      setKeywords(keywords.filter((kw) => kw.id !== deleteTarget.id));
      setResults(results.filter((r) => r.keywordId !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete keyword:', error);
    } finally {
      setDeleting(false);
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
        await new Promise((r) => setTimeout(r, 2000));
        await fetchAppData();
      }
    } catch (error) {
      console.error('Failed to run monitoring:', error);
    } finally {
      setMonitoring(false);
    }
  }

  // Group results by keyword
  const resultsByKeyword = useMemo(() => {
    const groups: Record<string, { keyword: Keyword; results: MonitoringResult[] }> = {};
    for (const kw of keywords) {
      groups[kw.id] = { keyword: kw, results: [] };
    }
    for (const result of results) {
      if (groups[result.keywordId]) {
        groups[result.keywordId].results.push(result);
      }
    }
    return Object.values(groups).filter((g) => g.results.length > 0);
  }, [keywords, results]);

  // Summary stats
  const totalMentions = results.filter((r) => r.mentionedInResponse).length;
  const totalResults = results.length;

  if (status === 'loading' || loading || !appId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050508] text-white/60">
        Loading...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050508]">
        <div className="text-center">
          <p className="text-xl text-white/45 mb-4">App not found</p>
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-white/40 hover:text-white/60 text-sm mb-4 inline-flex items-center gap-1 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold text-white">{app.name}</h1>
              <p className="text-white/45 text-sm mt-1">AI search visibility monitoring</p>
            </div>
            {isSubscribed ? (
              <button
                onClick={runMonitoring}
                disabled={monitoring || keywords.length === 0}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {monitoring ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
                    </svg>
                    Running...
                  </span>
                ) : (
                  'Run Monitoring'
                )}
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2 bg-zinc-700 text-white/40 font-semibold rounded-lg text-sm cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Subscribe to Monitor
              </button>
            )}
          </div>
        </div>

        {/* Paywall Banner — shown when not subscribed */}
        {!subLoading && !isSubscribed && (
          <PaywallBanner
            hasUsedTrial={subscription?.hasUsedTrial ?? false}
          />
        )}

        {/* Stats bar */}
        {totalResults > 0 && (
          <div className="flex gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-700/60 rounded-lg px-5 py-3 flex-1">
              <p className="text-xs text-white/40 uppercase tracking-wider">Keywords</p>
              <p className="text-2xl font-bold text-white mt-0.5">{keywords.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700/60 rounded-lg px-5 py-3 flex-1">
              <p className="text-xs text-white/40 uppercase tracking-wider">Mentions</p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                {totalMentions}
                <span className="text-sm font-normal text-white/35 ml-1">/ {totalResults}</span>
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700/60 rounded-lg px-5 py-3 flex-1">
              <p className="text-xs text-white/40 uppercase tracking-wider">Mention Rate</p>
              <p className="text-2xl font-bold text-white mt-0.5">
                {totalResults > 0 ? Math.round((totalMentions / totalResults) * 100) : 0}%
              </p>
            </div>
          </div>
        )}

        {/* Keywords Section */}
        <div className="bg-zinc-900 border border-zinc-700/60 rounded-lg overflow-hidden mb-8">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700/40">
            <h2 className="text-base font-semibold text-white/80">Tracked Keywords</h2>
            <span className="text-xs text-white/35">{keywords.length} keyword{keywords.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Add keyword input */}
          <div className="px-5 py-3 border-b border-zinc-700/30 bg-zinc-900/50">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder='Add keyword, e.g. "best database GUI tool for PostgreSQL"'
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700/60 text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-500/60 transition"
              />
              <button
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
                className="px-5 py-2 bg-cyan-500/15 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/25 transition text-sm font-medium text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Keyword list */}
          {keywords.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <svg className="w-10 h-10 mx-auto mb-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-white/35 text-sm">No keywords yet. Add one to start monitoring.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {keywords.map((kw, i) => {
                const kwResults = results.filter((r) => r.keywordId === kw.id);
                const mentions = kwResults.filter((r) => r.mentionedInResponse).length;
                return (
                  <div
                    key={kw.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-800/40 transition group"
                  >
                    {/* Index */}
                    <span className="text-xs text-white/20 w-5 text-right shrink-0 tabular-nums">{i + 1}</span>

                    {/* Keyword text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/75 truncate">{kw.keyword}</p>
                    </div>

                    {/* Mention stats (if has results) */}
                    {kwResults.length > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                        mentions > 0
                          ? 'bg-emerald-500/10 text-emerald-400/80'
                          : 'bg-zinc-800 text-white/30'
                      }`}>
                        {mentions}/{kwResults.length} mentioned
                      </span>
                    )}

                    {/* Last checked */}
                    {kw.lastCheckedAt && (
                      <span className="text-[11px] text-white/25 shrink-0 hidden sm:block">
                        {new Date(kw.lastCheckedAt).toLocaleDateString()}
                      </span>
                    )}

                    {/* Delete button — always visible */}
                    <button
                      onClick={() => setDeleteTarget(kw)}
                      className="p-1.5 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                      aria-label={`Delete keyword: ${kw.keyword}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Results grouped by keyword */}
        <div>
          <h2 className="text-base font-semibold text-white/80 mb-4">Monitoring Results</h2>

          {!isSubscribed && resultsByKeyword.length === 0 ? (
            <div className="text-center py-16 text-white/35 border border-zinc-800 rounded-xl bg-zinc-900/30">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm">Subscribe to unlock monitoring results</p>
            </div>
          ) : resultsByKeyword.length === 0 ? (
            <div className="text-center py-16 text-white/35">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No results yet. Run monitoring to check your brand visibility.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {resultsByKeyword.map(({ keyword: kw, results: kwResults }) => (
                <div key={kw.id} className="border border-zinc-800 rounded-xl overflow-hidden">
                  {/* Keyword header */}
                  <div className="bg-zinc-900/50 px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 font-medium text-sm">{kw.keyword}</span>
                      <span className="text-[10px] text-white/30 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {kwResults.length} source{kwResults.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {kw.lastCheckedAt && (
                      <span className="text-[10px] text-white/30">
                        Checked {new Date(kw.lastCheckedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Source cards */}
                  <div className="p-4 space-y-3 bg-[#0a0a0f]">
                    {/* Show Google AI Mode first, then ChatGPT */}
                    {['google_ai_mode', 'chatgpt'].map((source) => {
                      const result = kwResults.find((r) => r.source === source);
                      if (!result) return null;
                      return (
                        <SourceCard
                          key={result.id}
                          result={result}
                          brandName={app.name}
                          onViewFull={setModalResult}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        keyword={deleteTarget?.keyword || ''}
        onConfirm={confirmDeleteKeyword}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Full Response Modal */}
      <Modal
        open={!!modalResult}
        onClose={() => setModalResult(null)}
        wide
        title={
          modalResult
            ? `${modalResult.source === 'google_ai_mode' ? 'Google AI Mode' : 'ChatGPT'} — ${modalResult.queryText}`
            : undefined
        }
      >
        {modalResult && (() => {
          const links = parseJsonField<LinkItem>(modalResult.links);
          const citations = parseJsonField<CitationItem>(modalResult.citations);
          const allLinks: LinkItem[] = [];
          const seen = new Set<string>();
          for (const link of links) {
            if (link.url && !seen.has(link.url)) {
              seen.add(link.url);
              allLinks.push(link);
            }
          }
          for (const cit of citations) {
            for (const url of cit.urls || []) {
              if (!seen.has(url)) {
                seen.add(url);
                try {
                  const domain = new URL(url).hostname;
                  allLinks.push({ text: cit.text || domain, url, domain });
                } catch {}
              }
            }
          }

          return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: AI Response */}
              <div className="lg:col-span-3">
                {/* Mention badge */}
                <div className="mb-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      modalResult.mentionedInResponse
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {modalResult.mentionedInResponse ? '\u2713 Mentioned' : '\u2717 Not Mentioned'}
                  </span>
                  <span className="text-xs text-white/40 ml-3">
                    {new Date(modalResult.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Full AI Response */}
                <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                  <HighlightedResponse text={modalResult.aiResponse} brandName={app.name} />
                </div>
              </div>

              {/* Right: Cited Sources */}
              <div className="lg:col-span-2 lg:border-l lg:border-zinc-700/40 lg:pl-6">
                <h3 className="text-sm font-medium text-white/50 mb-3">
                  Cited Sources ({allLinks.length})
                </h3>
                {allLinks.length === 0 ? (
                  <p className="text-xs text-white/30">No cited sources</p>
                ) : (
                  <div className="space-y-2.5">
                    {allLinks.map((link, i) => {
                      let domain = (link as any).domain || '';
                      if (!domain) {
                        try { domain = new URL(link.url).hostname; } catch {}
                      }
                      return (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/30 hover:border-zinc-600/50 hover:bg-zinc-800 transition group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                            alt=""
                            width={16}
                            height={16}
                            className="rounded-sm mt-0.5 shrink-0 opacity-70 group-hover:opacity-100"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-white/55 truncate">{domain}</p>
                            <p className="text-xs text-white/40 truncate mt-0.5">{link.text || link.url}</p>
                          </div>
                          <svg className="w-3 h-3 text-white/20 group-hover:text-white/50 shrink-0 mt-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
