export const PLANS = {
  pro: {
    name: 'Pro',
    price: 49,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID!,
    limits: { maxApps: 3, maxKeywordsPerApp: 10 },
  },
  business: {
    name: 'Business',
    price: 199,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    limits: { maxApps: 10, maxKeywordsPerApp: 10 },
  },
} as const

export type PlanKey = keyof typeof PLANS

export const TRIAL_DAYS = 3

export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId === priceId) return key as PlanKey
  }
  return null
}
