import { db } from '@/lib/db'
import { users, subscriptions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { type PlanKey } from '@/lib/plans'

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

export function isActiveSubscription(status: string | undefined): boolean {
  return status === 'active' || status === 'trialing'
}
