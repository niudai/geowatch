'use client';

// Prevent static prerendering - this page requires auth
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface App {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAppName, setNewAppName] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

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

  async function createApp() {
    if (!newAppName.trim()) return;

    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAppName }),
      });

      const newApp = await res.json();
      setApps([...apps, newApp]);
      setNewAppName('');
    } catch (error) {
      console.error('Failed to create app:', error);
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">GeoWatch Dashboard</h1>
          <p className="text-gray-400">Monitor your brand mentions in AI search results</p>
        </div>

        {/* Create App Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create New App</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="App name (e.g., My SaaS)"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createApp()}
              className="flex-1 px-4 py-2 rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={createApp}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded font-semibold hover:opacity-90 transition"
            >
              Create
            </button>
          </div>
        </div>

        {/* Apps List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Apps</h2>
          {apps.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No apps yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app.id)}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-cyan-500 transition"
                >
                  <h3 className="text-xl font-bold mb-2">{app.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">Status: {app.status}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/${app.id}`);
                    }}
                    className="w-full px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 transition text-sm font-semibold"
                  >
                    Manage App
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
