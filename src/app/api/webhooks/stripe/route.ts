import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users, subscriptions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getPlanByPriceId } from '@/lib/plans'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          await upsertSubscription(stripeSubscription)

          // Mark trial as used if subscription is trialing
          if (stripeSubscription.status === 'trialing' && session.metadata?.userId) {
            await db
              .update(users)
              .set({ hasUsedTrial: true })
              .where(eq(users.id, session.metadata.userId))
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await upsertSubscription(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await db
          .update(subscriptions)
          .set({ status: 'canceled', updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const failedSubId = getSubscriptionIdFromInvoice(invoice)
        if (failedSubId) {
          await db
            .update(subscriptions)
            .set({ status: 'past_due', updatedAt: new Date() })
            .where(eq(subscriptions.stripeSubscriptionId, failedSubId))
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const paidSubId = getSubscriptionIdFromInvoice(invoice)
        if (paidSubId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(paidSubId)
          await upsertSubscription(stripeSubscription)
        }
        break
      }
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, err)
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription
  if (!sub) return null
  return typeof sub === 'string' ? sub : sub.id
}

async function upsertSubscription(stripeSubscription: Stripe.Subscription) {
  const customerId = stripeSubscription.customer as string
  const priceId = stripeSubscription.items.data[0]?.price?.id
  const plan = priceId ? getPlanByPriceId(priceId) : null

  // Find user by stripeCustomerId
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1)

  if (!user) {
    console.error('[Stripe Webhook] No user found for customer:', customerId)
    return
  }

  const values = {
    userId: user.id,
    stripeSubscriptionId: stripeSubscription.id,
    stripePriceId: priceId || '',
    plan: plan || 'pro',
    status: stripeSubscription.status,
    currentPeriodStart: new Date(stripeSubscription.start_date * 1000),
    currentPeriodEnd: stripeSubscription.cancel_at
      ? new Date(stripeSubscription.cancel_at * 1000)
      : null,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    updatedAt: new Date(),
  }

  // Try update first, insert if not found
  const updated = await db
    .update(subscriptions)
    .set(values)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))
    .returning()

  if (updated.length === 0) {
    await db.insert(subscriptions).values(values)
  }
}
