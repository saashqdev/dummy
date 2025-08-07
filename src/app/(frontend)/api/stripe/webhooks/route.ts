import { TFunction } from "i18next";
import Stripe from "stripe";
import { clearCacheKey } from "@/lib/services/cache.server";
import { db } from "@/db";
import { stripeService } from "@/modules/subscriptions/services/StripeService";
import { clearSubscriptionsCache } from "@/modules/subscriptions/services/SubscriptionService";
import { getServerTranslations } from "@/i18n/server";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SK?.toString() ?? "", {
  apiVersion: "2022-08-01",
});

export async function POST(request: Request) {
  const { t } = await getServerTranslations();
  const secret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET?.toString() ?? "";
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json("No signature", { status: 400 });
  }
  let event;
  const payload = await request.text();

  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.log(`⚠️  Webhook signature verification failed`, {
      err: err.message,
      sig,
      payload,
      secret,
    });
    return NextResponse.json(err.message, {
      status: 400,
    });
  }

  // eslint-disable-next-line no-console
  console.log({ event });

  if (event.type == "subscription_schedule.canceled") {
    const subscription = event.data.object as Stripe.SubscriptionSchedule;
    await updateTenantSubscription({ t, stripeSubscriptionId: subscription.id });
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await updateTenantSubscription({ t, stripeSubscriptionId: subscription.id });
  } else if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await updateTenantSubscription({ t, stripeSubscriptionId: subscription.id });
  }
  return NextResponse.json({
    received: true,
    event: event.type,
  });
}

async function updateTenantSubscription({ t, stripeSubscriptionId }: { t: TFunction; stripeSubscriptionId: string }) {
  await clearSubscriptionsCache();
  const stripeSubscription = await stripeService.getStripeSubscription(stripeSubscriptionId);
  if (!stripeSubscription) {
    // eslint-disable-next-line no-console
    console.log("Subscription not found: " + stripeSubscriptionId);
    throw NextResponse.json("Subscription not found", { status: 404 });
  }
  const tenantSubscriptionProduct = await db.tenantSubscriptionProduct.getByStripeSubscriptionId(stripeSubscription.id);
  if (!tenantSubscriptionProduct) {
    // eslint-disable-next-line no-console
    console.log("Account subscription not found: " + stripeSubscriptionId);
    throw NextResponse.json("Account subscription not found", { status: 404 });
  }
  const tenantSubscription = await db.tenantSubscription.get(tenantSubscriptionProduct.tenantSubscriptionId);
  // eslint-disable-next-line no-console
  console.log({ stripeSubscription });
  let cancelledAt: Date | null = null;
  let endsAt: Date | null = null;
  if (stripeSubscription.cancel_at) {
    endsAt = new Date(stripeSubscription.cancel_at * 1000);
    cancelledAt = new Date(stripeSubscription.cancel_at * 1000);
  } else if (stripeSubscription.canceled_at) {
    cancelledAt = new Date(stripeSubscription.canceled_at * 1000);
    endsAt = stripeSubscription.ended_at ? new Date(stripeSubscription.ended_at * 1000) : new Date();
  }
  const data: {
    endsAt: Date | null | undefined;
    cancelledAt: Date | null | undefined;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  } = {
    cancelledAt,
    endsAt,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
  };
  const today = new Date();
  // notify if has ended
  if (data.currentPeriodEnd && data.currentPeriodEnd <= today && !tenantSubscriptionProduct.endsAt) {
    // eslint-disable-next-line no-console
    console.log("Subscription ended", { data });
  } else if (data.cancelledAt && tenantSubscriptionProduct.cancelledAt === null) {
    // eslint-disable-next-line no-console
    console.log("Subscription cancelled", { data });
  }
  // eslint-disable-next-line no-console
  console.log({ data });
  await db.tenantSubscriptionProduct
    .update(tenantSubscriptionProduct.id, {
      cancelledAt: data.cancelledAt,
      endsAt: data.endsAt,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
    })
    .then(() => {
      if (tenantSubscription) {
        clearCacheKey(`tenantSubscription:${tenantSubscription.tenantId}`);
      }
    });
}
