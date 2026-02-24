'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateAppWizard from '@/components/CreateAppWizard';
import { useSubscription } from '@/hooks/useSubscription';

interface App {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
}

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const { subscription, loading: subLoading, refresh: refreshSubscription } = useSubscription();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApps();
    }
  }, [status]);

  // Handle checkout return
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setCheckoutSuccess(true);
      refreshSubscription();
      // Clean URL
      window.history.replaceState({}, '', '/dashboard');
      setTimeout(() => setCheckoutSuccess(false), 5000);
    }
  }, [searchParams, refreshSubscription]);

  async function fetchApps() {
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      setApps(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch apps:', error);
      setLoading(false);
    }
  }

  function handleCreateApp() {
    setShowWizard(true);
  }

  const planLabel = subscription?.plan === 'free' ? 'Free Tier' :
    subscription?.plan === 'pro' ? 'Pro Plan' :
    subscription?.plan === 'business' ? 'Business Plan' : '';

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050508] text-white/60">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Checkout success banner */}
        {checkoutSuccess && (
          <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400 flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Subscription activated! You can now run monitoring on your apps.
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">GeoWatch Dashboard</h1>
            <p className="text-white/45 text-sm mt-1">Monitor your brand mentions in AI search results</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Subscription badge */}
            {!subLoading && planLabel && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                subscription?.plan === 'free'
                  ? 'bg-zinc-800 text-white/50 border border-zinc-700/60'
                  : subscription?.status === 'trialing'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}>
                {subscription?.status === 'trialing' ? `${planLabel} (Trial)` : planLabel}
              </span>
            )}
            {/* Manage billing button — only for paying users */}
            {subscription?.plan && subscription.plan !== 'free' && (
              <button
                onClick={() => router.push('/dashboard/billing')}
                className="px-3 py-1.5 text-xs text-white/50 hover:text-white/70 border border-zinc-700/60 rounded-lg transition"
              >
                Manage Billing
              </button>
            )}
            <button
              onClick={handleCreateApp}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition text-sm"
            >
              + Create New App
            </button>
          </div>
        </div>

        {/* Apps List */}
        {apps.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-white/40 mb-4">No apps yet. Create one to start monitoring.</p>
            <button
              onClick={handleCreateApp}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition text-sm"
            >
              Create Your First App
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map((app) => (
              <div
                key={app.id}
                onClick={() => router.push(`/dashboard/${app.id}`)}
                className="bg-zinc-900 border border-zinc-700/60 rounded-lg p-6 cursor-pointer hover:border-cyan-500/60 transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition">
                    {app.name}
                  </h3>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                    app.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-zinc-700 text-white/40'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-xs text-white/35">
                  Created {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create App Wizard */}
      {showWizard && (
        <CreateAppWizard
          onComplete={(appId) => {
            setShowWizard(false);
            fetchApps();
            refreshSubscription();
            router.push(`/dashboard/${appId}`);
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
