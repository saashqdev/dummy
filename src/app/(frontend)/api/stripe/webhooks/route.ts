import { TFunction } from 'i18next'
import Stripe from 'stripe'
import { clearCacheKey } from '@/lib/services/cache.server'
import { db } from '@/db'
import { stripeService } from '@/modules/subscriptions/services/StripeService'
import { clearSubscriptionsCache } from '@/modules/subscriptions/services/SubscriptionService'
import { getServerTranslations } from '@/i18n/server'
import { NextResponse } from 'next/server'

import { getCachedGlobal } from '@/utilities/getGlobals'

export async function POST(request: Request) {
  const { t } = await getServerTranslations()

  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json('No signature', { status: 400 })
  }

  const { stripe: stripeOptions } = await getCachedGlobal('paywalls', 'en', 1)()
  const secret = stripeOptions?.secret

  const endpointSecret = stripeOptions?.webhookSecret ?? ''

  if (!secret) {
    return Response.json({ status: 400 })
  }

  const rawBody = await request.text()

  const stripe = new Stripe(secret)

  let event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
  } catch (error) {
    if (error instanceof Error) {
      return new Response(`Webhook Error: ${error.message}`, { status: 400 })
    }
    return new Response('Webhook Error: Unknown error', { status: 400 })
  }

  // eslint-disable-next-line no-console
  console.log({ event })

  if (event.type == 'subscription_schedule.canceled') {
    const subscription = event.data.object as Stripe.SubscriptionSchedule
    await updateTenantSubscription({ t, stripeSubscriptionId: subscription.id })
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await updateTenantSubscription({ t, stripeSubscriptionId: subscription.id })
  } else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    await updateTenantSubscription({ t, stripeSubscriptionId: subscription.id })
  }
  return NextResponse.json({
    received: true,
    event: event.type,
  })
}

async function updateTenantSubscription({
  t,
  stripeSubscriptionId,
}: {
  t: TFunction
  stripeSubscriptionId: string
}) {
  await clearSubscriptionsCache()
  const stripeSubscription = await stripeService.getStripeSubscription(stripeSubscriptionId)
  if (!stripeSubscription) {
    // eslint-disable-next-line no-console
    console.log('Subscription not found: ' + stripeSubscriptionId)
    throw NextResponse.json('Subscription not found', { status: 404 })
  }
  const tenantSubscriptionProduct = await db.tenantSubscriptionProduct.getByStripeSubscriptionId(
    stripeSubscription.id,
  )
  if (!tenantSubscriptionProduct) {
    // eslint-disable-next-line no-console
    console.log('Account subscription not found: ' + stripeSubscriptionId)
    throw NextResponse.json('Account subscription not found', { status: 404 })
  }
  const tenantSubscription = await db.tenantSubscription.get(
    tenantSubscriptionProduct.tenant_subscription_id,
  )
  // eslint-disable-next-line no-console
  console.log({ stripeSubscription })
  let cancelledAt: Date | null = null
  let endsAt: Date | null = null
  if (stripeSubscription.cancel_at) {
    endsAt = new Date(stripeSubscription.cancel_at * 1000)
    cancelledAt = new Date(stripeSubscription.cancel_at * 1000)
  } else if (stripeSubscription.canceled_at) {
    cancelledAt = new Date(stripeSubscription.canceled_at * 1000)
    endsAt = stripeSubscription.ended_at ? new Date(stripeSubscription.ended_at * 1000) : new Date()
  }
  const data: {
    endsAt: Date | null | undefined
    cancelledAt: Date | null | undefined
    currentPeriodStart: Date
    currentPeriodEnd: Date | null
  } = {
    cancelledAt,
    endsAt,
    currentPeriodStart: new Date(stripeSubscription.start_date * 1000),
    currentPeriodEnd: stripeSubscription.ended_at
      ? new Date(stripeSubscription.ended_at * 1000)
      : null,
  }
  const today = new Date()
  // notify if has ended
  if (
    data.currentPeriodEnd &&
    data.currentPeriodEnd <= today &&
    !tenantSubscriptionProduct.ends_at
  ) {
    // eslint-disable-next-line no-console
    console.log('Subscription ended', { data })
  } else if (data.cancelledAt && tenantSubscriptionProduct.cancelled_at === null) {
    // eslint-disable-next-line no-console
    console.log('Subscription cancelled', { data })
  }
  // eslint-disable-next-line no-console
  console.log({ data })
  await db.tenantSubscriptionProduct
    .update(tenantSubscriptionProduct.id, {
      cancelled_at: data.cancelledAt,
      ends_at: data.endsAt,
      current_period_start: data.currentPeriodStart,
      current_period_end: data.currentPeriodEnd,
    })
    .then(() => {
      if (tenantSubscription) {
        clearCacheKey(`tenantSubscription:${tenantSubscription.tenant_id}`)
      }
    })
}
