'use client'

import { useState, useEffect, useCallback } from 'react'

interface SubscriptionData {
  plan: string
  status: string | null
  hasUsedTrial: boolean
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  limits: { maxApps: number; maxKeywordsPerApp: number }
  usage: { apps: number }
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data)
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { subscription, loading, refresh }
}
