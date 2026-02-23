import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'
import { PLANS, TRIAL_DAYS, type PlanKey } from '@/lib/plans'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const plan = body.plan as PlanKey

  if (!plan || !PLANS[plan]) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Get or create Stripe customer
  const [user] = await db
    .select({ stripeCustomerId: users.stripeCustomerId, hasUsedTrial: users.hasUsedTrial })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  let customerId = user?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id

    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, session.user.id))
  }

  // Build checkout session params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://geowatch.ai'

  const checkoutParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PLANS[plan].stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/dashboard?checkout=canceled`,
    metadata: { userId: session.user.id, plan },
  }

  // Add trial if user hasn't used it before
  if (!user?.hasUsedTrial) {
    checkoutParams.subscription_data = {
      trial_period_days: TRIAL_DAYS,
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams)
    return Response.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return Response.json({ error: message }, { status: 500 })
  }
}
