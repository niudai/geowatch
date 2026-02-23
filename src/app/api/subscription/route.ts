import { auth } from '@/auth'
import { db } from '@/lib/db'
import { apps } from '@/lib/schema'
import { eq, count } from 'drizzle-orm'
import { getUserSubscription, isActiveSubscription } from '@/lib/subscription'
import { PLANS } from '@/lib/plans'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sub = await getUserSubscription(session.user.id)

  const activePlan = sub?.plan && isActiveSubscription(sub.status)
    ? sub.plan
    : undefined
  const limits = activePlan ? PLANS[activePlan].limits : { maxApps: 0, maxKeywordsPerApp: 0 }

  const [appCount] = await db
    .select({ count: count() })
    .from(apps)
    .where(eq(apps.userId, session.user.id))

  return Response.json({
    plan: activePlan || 'free',
    status: sub?.status || null,
    hasUsedTrial: sub?.hasUsedTrial ?? false,
    currentPeriodEnd: sub?.currentPeriodEnd || null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd || false,
    limits,
    usage: {
      apps: appCount?.count ?? 0,
    },
  })
}
