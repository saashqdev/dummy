'use server'

import { getTenant } from '@/modules/accounts/services/TenantService'
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
import Stripe from 'stripe'
import { stripeService } from '@/modules/subscriptions/services/StripeService'
import { getOrPersistTenantSubscription } from '@/modules/subscriptions/services/TenantSubscriptionService'
import { promiseHash } from '@/lib/utils'

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

export default async function () {
  const data = await loader()
  return <Component data={data} />
}
