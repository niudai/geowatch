import { auth } from '@/auth'
import { db } from '@/lib/db'
import { apps } from '@/lib/schema'
import { eq, count } from 'drizzle-orm'
import { getUserSubscription, getLimits } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sub = await getUserSubscription(session.user.id)

  const activePlan = sub?.plan && (sub.status === 'active' || sub.status === 'trialing')
    ? sub.plan
    : undefined
  const limits = getLimits(activePlan)

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
