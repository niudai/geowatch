import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [user] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user?.stripeCustomerId) {
    return Response.json({ error: 'No billing account found' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://geowatch.ai'

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard`,
  })

  return Response.json({ url: portalSession.url })
}
