'use client'

import { useState } from 'react'

interface SubscribeModalProps {
  open: boolean
  onClose: () => void
  reason?: string
  hasUsedTrial: boolean
}

const plans = [
  {
    key: 'pro' as const,
    name: 'Pro',
    price: 49,
    features: [
      'Up to 3 apps',
      '10 keywords per app',
      'Daily AI monitoring',
      'Google AI + ChatGPT',
      'Email reports',
    ],
  },
  {
    key: 'business' as const,
    name: 'Business',
    price: 199,
    badge: 'Best Value',
    features: [
      'Up to 10 apps',
      '10 keywords per app',
      'Real-time monitoring',
      'All AI platforms',
      'Priority support',
      'API access',
    ],
  },
]

export default function SubscribeModal({ open, onClose, reason, hasUsedTrial }: SubscribeModalProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubscribe(plan: 'pro' | 'business') {
    setLoading(plan)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create checkout session. Please try again.')
        setLoading(null)
        return
      }
      if (!data.url) {
        setError('No checkout URL returned. Please try again.')
        setLoading(null)
        return
      }
      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Network error. Please check your connection and try again.')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-zinc-900 border border-zinc-700/60 rounded-xl max-w-2xl w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Upgrade Your Plan</h2>
          {reason && (
            <p className="text-sm text-amber-400/80">{reason}</p>
          )}
          {!hasUsedTrial && (
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-xs font-medium text-emerald-400">
              3-day free trial included
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-xl border p-5 ${
                plan.badge
                  ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-900/20 to-zinc-900'
                  : 'border-zinc-700/60 bg-zinc-800/50'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-[10px] font-semibold text-black">
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">${plan.price}</span>
                <span className="text-sm text-white/40">/mo</span>
              </div>

              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading !== null}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                  plan.badge
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                }`}
              >
                {loading === plan.key ? 'Redirecting...' : `Subscribe to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
