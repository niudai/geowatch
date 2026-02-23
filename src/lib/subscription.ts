import { db } from '@/lib/db'
import { users, subscriptions, apps, keywords } from '@/lib/schema'
import { eq, and, count } from 'drizzle-orm'
import { PLANS, FREE_LIMITS, type PlanKey } from '@/lib/plans'

export async function getUserSubscription(userId: string) {
  const [user] = await db
    .select({
      stripeCustomerId: users.stripeCustomerId,
      hasUsedTrial: users.hasUsedTrial,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return null

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  return {
    plan: sub?.plan as PlanKey | undefined,
    status: sub?.status,
    stripeSubscriptionId: sub?.stripeSubscriptionId,
    stripePriceId: sub?.stripePriceId,
    currentPeriodEnd: sub?.currentPeriodEnd,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd,
    stripeCustomerId: user.stripeCustomerId,
    hasUsedTrial: user.hasUsedTrial,
  }
}

export function getLimits(plan: PlanKey | undefined) {
  if (!plan) return FREE_LIMITS
  return PLANS[plan]?.limits ?? FREE_LIMITS
}

export async function canCreateApp(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId)
  const limits = getLimits(sub?.plan && (sub.status === 'active' || sub.status === 'trialing') ? sub.plan : undefined)

  const [result] = await db
    .select({ count: count() })
    .from(apps)
    .where(eq(apps.userId, userId))

  const appCount = result?.count ?? 0

  if (appCount >= limits.maxApps) {
    return {
      allowed: false,
      reason: `You've reached the limit of ${limits.maxApps} app${limits.maxApps === 1 ? '' : 's'} on your ${sub?.plan ? PLANS[sub.plan].name : 'Free'} plan. Upgrade to create more.`,
    }
  }

  return { allowed: true }
}

export async function canAddKeyword(appId: string, userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId)
  const limits = getLimits(sub?.plan && (sub.status === 'active' || sub.status === 'trialing') ? sub.plan : undefined)

  const [result] = await db
    .select({ count: count() })
    .from(keywords)
    .where(eq(keywords.appId, appId))

  const kwCount = result?.count ?? 0

  if (kwCount >= limits.maxKeywordsPerApp) {
    return {
      allowed: false,
      reason: `You've reached the limit of ${limits.maxKeywordsPerApp} keywords per app on your ${sub?.plan ? PLANS[sub.plan].name : 'Free'} plan. Upgrade to add more.`,
    }
  }

  return { allowed: true }
}

export function isActiveSubscription(status: string | undefined): boolean {
  return status === 'active' || status === 'trialing'
}
