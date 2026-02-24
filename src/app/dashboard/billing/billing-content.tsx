'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import SubscribeModal from '@/components/SubscribeModal'

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

const statusLabels: Record<string, { text: string; className: string }> = {
  active: { text: 'Active', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  trialing: { text: 'Trial', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  past_due: { text: 'Past Due', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  canceled: { text: 'Canceled', className: 'bg-zinc-700/50 text-white/40 border-zinc-600/40' },
}

export default function BillingContent() {
  const { status: authStatus } = useSession()
  const { subscription, loading } = useSubscription()
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  if (authStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64 text-white/60">
        Loading...
      </div>
    )
  }

  const plan = subscription?.plan || 'free'
  const status = subscription?.status
  const statusInfo = status ? statusLabels[status] : null
  const isActive = status === 'active' || status === 'trialing'
  const isFree = plan === 'free'

  const planName = plan === 'pro' ? 'Pro' : plan === 'business' ? 'Business' : 'Free'
  const planPrice = plan === 'pro' ? 49 : plan === 'business' ? 199 : 0

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null

  const maxApps = subscription?.limits?.maxApps ?? 0
  const usedApps = subscription?.usage?.apps ?? 0
  const usagePercent = maxApps > 0 ? Math.min((usedApps / maxApps) * 100, 100) : 0

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Portal error:', err)
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Billing & Subscription</h1>
          <p className="text-white/45 text-sm mt-1">Manage your plan, usage, and payment details</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Current Plan</h2>
            {statusInfo && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusInfo.className}`}>
                {statusInfo.text}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-white">{planName}</span>
            {!isFree && (
              <span className="text-white/40 text-sm">
                ${planPrice}/mo
              </span>
            )}
          </div>
          {periodEnd && isActive && (
            <p className="text-xs text-white/35">
              {subscription?.cancelAtPeriodEnd
                ? `Access until ${periodEnd.toLocaleDateString()}`
                : `Renews on ${periodEnd.toLocaleDateString()}`
              }
            </p>
          )}
          {isFree && (
            <p className="text-xs text-white/35">No active subscription</p>
          )}
        </div>

        {/* Cancel Warning */}
        {subscription?.cancelAtPeriodEnd && periodEnd && (
          <div className="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400 flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your subscription is set to cancel. You&apos;ll have access until {periodEnd.toLocaleDateString()}.
          </div>
        )}

        {/* Usage Card */}
        {!isFree && (
          <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-6 mb-4">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Usage</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">Apps</span>
              <span className="text-sm text-white/70">{usedApps} / {maxApps}</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions Card */}
        <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {!isFree && (
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="px-4 py-2.5 text-sm border border-zinc-700/60 rounded-lg text-white/70 hover:text-white hover:border-zinc-600 transition disabled:opacity-50"
              >
                {portalLoading ? 'Loading...' : 'Manage Payment & Invoices'}
              </button>
            )}
            <button
              onClick={() => setShowSubscribeModal(true)}
              className="px-4 py-2.5 text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition"
            >
              {isFree ? 'Upgrade' : 'Change Plan'}
            </button>
          </div>
        </div>

        {/* Plan Comparison */}
        <div>
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((p) => {
              const isCurrent = p.key === plan
              return (
                <div
                  key={p.key}
                  className={`relative rounded-xl border p-5 ${
                    isCurrent
                      ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-900/20 to-zinc-900'
                      : 'border-zinc-700/60 bg-zinc-900'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-[10px] font-semibold text-black">
                        Current Plan
                      </span>
                    </div>
                  )}
                  {!isCurrent && p.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-700 text-[10px] font-semibold text-white/60">
                        {p.badge}
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-white mb-1">{p.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">${p.price}</span>
                    <span className="text-sm text-white/40">/mo</span>
                  </div>

                  <ul className="space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Subscribe Modal */}
      <SubscribeModal
        open={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        hasUsedTrial={subscription?.hasUsedTrial ?? false}
      />
    </div>
  )
}
