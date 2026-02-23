'use client';

import { useState } from 'react';
import type { ProductProfile } from '@/lib/types';

interface CreateAppWizardProps {
  onComplete: (appId: string) => void;
  onCancel: () => void;
}

const STEPS = ['Product Name', 'Website URL', 'Analyzing', 'Review & Edit', 'Creating'];

function EditableList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = e.target.value;
              onChange(updated);
            }}
            className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700/60 text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/60 transition"
            placeholder={placeholder}
          />
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-white/30 hover:text-red-400 transition px-2 text-lg"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ''])}
        className="text-xs text-cyan-400/70 hover:text-cyan-400 transition"
      >
        + Add item
      </button>
    </div>
  );
}

function EditableCompetitors({
  items,
  onChange,
}: {
  items: Array<{ name: string; description: string }>;
  onChange: (items: Array<{ name: string; description: string }>) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item.name}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = { ...updated[i], name: e.target.value };
              onChange(updated);
            }}
            className="w-1/3 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700/60 text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/60 transition"
            placeholder="Name"
          />
          <input
            type="text"
            value={item.description}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = { ...updated[i], description: e.target.value };
              onChange(updated);
            }}
            className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700/60 text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/60 transition"
            placeholder="Description"
          />
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-white/30 hover:text-red-400 transition px-2 text-lg"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { name: '', description: '' }])}
        className="text-xs text-cyan-400/70 hover:text-cyan-400 transition"
      >
        + Add competitor
      </button>
    </div>
  );
}

export default function CreateAppWizard({ onComplete, onCancel }: CreateAppWizardProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [profile, setProfile] = useState<ProductProfile | null>(null);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  async function analyzeWebsite() {
    setStep(2);
    setAnalyzing(true);
    setError('');

    try {
      const res = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errMsg = data.error || 'Analysis failed';
        // URL format errors → go back to URL step so user can fix it
        if (res.status === 400 || errMsg.toLowerCase().includes('url') || errMsg.toLowerCase().includes('invalid')) {
          setError(errMsg);
          setAnalyzing(false);
          setStep(1);
          return;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setProfile(data.profile);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  async function createApp() {
    setStep(4);
    setError('');

    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          domain: normalizedUrl,
          productProfile: profile,
          keywords: profile?.monitoringKeywords || [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create app');
      }

      const newApp = await res.json();
      onComplete(newApp.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create app');
      setStep(3); // Go back to review
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`bg-zinc-900 border border-zinc-700/60 rounded-xl w-full mx-4 max-h-[90vh] flex flex-col ${step === 3 ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {/* Header with steps */}
        <div className="px-6 py-4 border-b border-zinc-700/40 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Create New App</h2>
            <button onClick={onCancel} className="text-white/40 hover:text-white/70 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1 rounded-full transition ${
                    i <= step ? 'bg-cyan-500' : 'bg-zinc-700'
                  }`}
                />
                <p className={`text-[10px] mt-1 ${i === step ? 'text-cyan-400' : 'text-white/30'}`}>
                  {s}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          {/* Step 0: Product Name */}
          {step === 0 && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                What&apos;s your product or brand name?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. GeoWatch, Notion, Stripe"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700/60 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/60 transition text-base"
                autoFocus
              />
              <p className="text-xs text-white/35 mt-2">
                This name will be used to detect brand mentions in AI responses.
              </p>
            </div>
          )}

          {/* Step 1: Website URL */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                What&apos;s your website URL?
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder="e.g. geowatch.ai or https://example.com"
                className={`w-full px-4 py-3 rounded-lg bg-zinc-800 border text-white placeholder-white/30 focus:outline-none transition text-base ${
                  error ? 'border-red-500/60 focus:border-red-500' : 'border-zinc-700/60 focus:border-cyan-500/60'
                }`}
                autoFocus
              />
              {error ? (
                <p className="text-xs text-red-400 mt-2">{error}</p>
              ) : (
                <p className="text-xs text-white/35 mt-2">
                  We&apos;ll analyze your landing page to automatically generate a product profile, competitors, and monitoring keywords.
                </p>
              )}
            </div>
          )}

          {/* Step 2: Analyzing */}
          {step === 2 && (
            <div className="text-center py-8">
              {analyzing ? (
                <>
                  <svg className="w-10 h-10 animate-spin mx-auto text-cyan-400 mb-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
                  </svg>
                  <p className="text-white/70 text-sm">Fetching and analyzing your website...</p>
                  <p className="text-white/35 text-xs mt-2">This may take up to 30 seconds</p>
                </>
              ) : error ? (
                <>
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => analyzeWebsite()}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition text-sm"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        setProfile({
                          whatItDoes: '',
                          targetAudience: '',
                          keyBenefits: [''],
                          useCases: [''],
                          uniqueSellingPoints: [''],
                          competitors: [{ name: '', description: '' }],
                          monitoringKeywords: [''],
                        });
                        setStep(3);
                      }}
                      className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition text-sm"
                    >
                      Skip &amp; Fill Manually
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Step 3: Review & Edit — two-column layout */}
          {step === 3 && profile && (
            <div>
              <div className="grid grid-cols-2 gap-6">
                {/* Left column: Product overview */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">What it does</label>
                    <textarea
                      value={profile.whatItDoes}
                      onChange={(e) => setProfile({ ...profile, whatItDoes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700/60 text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/60 transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Target Audience</label>
                    <textarea
                      value={profile.targetAudience}
                      onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700/60 text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/60 transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Key Benefits</label>
                    <EditableList
                      items={profile.keyBenefits}
                      onChange={(items) => setProfile({ ...profile, keyBenefits: items })}
                      placeholder="Benefit"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Use Cases</label>
                    <EditableList
                      items={profile.useCases}
                      onChange={(items) => setProfile({ ...profile, useCases: items })}
                      placeholder="Use case"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Unique Selling Points</label>
                    <EditableList
                      items={profile.uniqueSellingPoints}
                      onChange={(items) => setProfile({ ...profile, uniqueSellingPoints: items })}
                      placeholder="USP"
                    />
                  </div>
                </div>

                {/* Right column: Competitors & Keywords */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Competitors</label>
                    <EditableCompetitors
                      items={profile.competitors}
                      onChange={(items) => setProfile({ ...profile, competitors: items })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Monitoring Keywords</label>
                    <EditableList
                      items={profile.monitoringKeywords}
                      onChange={(items) => setProfile({ ...profile, monitoringKeywords: items })}
                      placeholder="Search query keyword"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
            </div>
          )}

          {/* Step 4: Creating */}
          {step === 4 && (
            <div className="text-center py-8">
              <svg className="w-10 h-10 animate-spin mx-auto text-cyan-400 mb-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
              </svg>
              <p className="text-white/70 text-sm">Creating your app and setting up monitoring...</p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {(step === 0 || step === 1 || step === 3) && (
          <div className="px-6 py-4 border-t border-zinc-700/40 flex justify-between shrink-0">
            <button
              onClick={() => {
                if (step === 0) onCancel();
                else setStep(step - 1);
              }}
              className="px-4 py-2 text-sm text-white/50 hover:text-white/70 transition"
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step === 0 && (
              <button
                onClick={() => setStep(1)}
                disabled={!name.trim()}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
            {step === 1 && (
              <button
                onClick={analyzeWebsite}
                disabled={!url.trim()}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Analyze
              </button>
            )}
            {step === 3 && (
              <button
                onClick={createApp}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition text-sm"
              >
                Create App
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
