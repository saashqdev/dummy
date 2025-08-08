'use server'

import { getTenant } from '@/modules/accounts/services/TenantService'
import { db } from '@/db'
import { getUser } from '@/modules/accounts/services/UserService'
import { getTenantIdFromUrl } from '@/modules/accounts/services/TenantService'
import { PlanFeatureUsageDto } from '@/modules/subscriptions/dtos/PlanFeatureUsageDto'
import { getPlanFeaturesUsage } from '@/modules/subscriptions/services/SubscriptionService'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { getUserInfo } from '@/lib/services/session.server'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import { requireTenantSlug } from '@/lib/services/url.server'
import Component from './component'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { stripeService } from '@/modules/subscriptions/services/StripeService'
import {
  cancelTenantSubscriptionProduct,
  getOrPersistTenantSubscription,
} from '@/modules/subscriptions/services/TenantSubscriptionService'
import { promiseHash } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('settings.members.actions.new')} | ${defaultSiteTags.title}`,
  })
}

export type AppSettingsSubscriptionLoaderData =
  | {
      customer: Stripe.Customer | Stripe.DeletedCustomer | null
      myInvoices: Stripe.Invoice[]
      myPayments: Stripe.PaymentIntent[]
      myFeatures: PlanFeatureUsageDto[]
      myUpcomingInvoice: Stripe.Invoice | null
      myPaymentMethods: Stripe.PaymentMethod[]
    }
  | {
      error: string
    }
const loader = async (): Promise<AppSettingsSubscriptionLoaderData> => {
  let { t } = await getServerTranslations()
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.subscription.view', tenantId)

  const userInfo = await getUserInfo()
  const user = await getUser(userInfo.userId!)
  if (!user) {
    return { error: 'Invalid user' }
  }
  const tenant = await getTenant(tenantId)
  if (!tenant) {
    return { error: 'Invalid tenant with id: ' + tenantId }
  }

  const tenantSubscription = await getOrPersistTenantSubscription(tenantId)
  const { customer, myInvoices, myPayments, myUpcomingInvoice, myPaymentMethods, myFeatures } =
    await promiseHash({
      customer: stripeService
        .getStripeCustomer(tenantSubscription.stripe_customer_id)
        .catch(() => null),
      myInvoices: stripeService.getStripeInvoices(tenantSubscription.stripe_customer_id) ?? [],
      myPayments:
        stripeService.getStripePaymentIntents(tenantSubscription.stripe_customer_id, 'succeeded') ??
        [],
      myUpcomingInvoice: stripeService.getStripeUpcomingInvoice(
        tenantSubscription.stripe_customer_id,
      ),
      myPaymentMethods: stripeService.getStripePaymentMethods(
        tenantSubscription.stripe_customer_id,
      ),
      myFeatures: getPlanFeaturesUsage(tenantId),
    })
  const data: AppSettingsSubscriptionLoaderData = {
    customer,
    myFeatures,
    myInvoices,
    myPayments,
    myUpcomingInvoice,
    myPaymentMethods,
  }
  return data
}

export const actionAppSettingsSubscription = async (prev: any, form: FormData) => {
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.subscription.update', tenantId)
  const tenantSubscription = await db.tenantSubscription.get(tenantId)

  const action = form.get('action')?.toString()

  if (!tenantSubscription || !tenantSubscription?.stripe_customer_id) {
    return {
      error: 'Invalid stripe customer: ' + (tenantSubscription?.stripe_customer_id || 'empty'),
    }
  } else if (action === 'cancel') {
    await verifyUserHasPermission('app.settings.subscription.delete', tenantId)
    const tenantSubscriptionProductId = form.get('tenant-subscription-product-id')?.toString() ?? ''
    const tenantSubscriptionProduct = await db.tenantSubscriptionProduct.get(
      tenantSubscriptionProductId,
    )
    if (!tenantSubscriptionProduct?.stripe_subscription_id) {
      return { error: 'Not subscribed' }
    }
    await stripeService.cancelStripeSubscription(tenantSubscriptionProduct?.stripe_subscription_id)
    const stripeSubscription = await stripeService.getStripeSubscription(
      tenantSubscriptionProduct.stripe_subscription_id,
    )
    await cancelTenantSubscriptionProduct(tenantSubscriptionProduct.id, {
      cancelled_at: new Date(),
      ends_at: stripeSubscription?.ended_at
        ? new Date(stripeSubscription.ended_at * 1000)
        : new Date(),
    })
    revalidatePath(`/app/${tenantSlug}/settings/subscription`)
    return {
      success: 'Successfully cancelled',
    }
  } else if (action === 'add-payment-method') {
    const session = await stripeService.createStripeSetupSession(
      tenantSubscription.stripe_customer_id,
    )
    return redirect(session?.url ?? '')
  } else if (action === 'delete-payment-method') {
    await stripeService.deleteStripePaymentMethod(form.get('id')?.toString() ?? '')
    return {}
  } else if (action === 'open-customer-portal') {
    const session = await stripeService.createCustomerPortalSession(
      tenantSubscription.stripe_customer_id,
    )
    return redirect(session?.url ?? '')
  }
}

export default async function () {
  const data = await loader()
  return <Component data={data} />
}
