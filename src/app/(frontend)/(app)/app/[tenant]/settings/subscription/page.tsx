'use server'

import { getTenant } from '@/modules/accounts/services/TenantService'
import { db } from '@/db'
import { getUser } from '@/modules/accounts/services/UserService'
import { sendEmail } from '@/modules/emails/services/EmailService'
import { getTenantIdFromUrl } from '@/modules/accounts/services/TenantService'
import { PlanFeatureUsageDto } from '@/modules/subscriptions/dtos/PlanFeatureUsageDto'
import {
  getPlanFeaturesUsage,
  getPlanFeatureUsage,
} from '@/modules/subscriptions/services/SubscriptionService'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { DefaultAppFeatures } from '@/modules/subscriptions/data/appFeatures'
import { getBaseURL } from '@/lib/services/url.server'
import { getUserInfo } from '@/lib/services/session.server'
import EmailTemplates from '@/modules/emails/utils/EmailTemplates'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
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
import SubscriptionSettings from '@/modules/subscriptions/components/SubscriptionSettings'
import useAppData from '@/lib/state/useAppData'
import IndexPageLayout from '@/components/ui/layouts/IndexPageLayout'

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
  const user = await getUser(userInfo.user_id!)
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
        .getStripeCustomer(tenantSubscription.stripeCustomerId)
        .catch(() => null),
      myInvoices: stripeService.getStripeInvoices(tenantSubscription.stripeCustomerId) ?? [],
      myPayments:
        stripeService.getStripePaymentIntents(tenantSubscription.stripeCustomerId, 'succeeded') ??
        [],
      myUpcomingInvoice: stripeService.getStripeUpcomingInvoice(
        tenantSubscription.stripeCustomerId,
      ),
      myPaymentMethods: stripeService.getStripePaymentMethods(tenantSubscription.stripeCustomerId),
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

  if (!tenantSubscription || !tenantSubscription?.stripeCustomerId) {
    return {
      error: 'Invalid stripe customer: ' + (tenantSubscription?.stripeCustomerId || 'empty'),
    }
  } else if (action === 'cancel') {
    await verifyUserHasPermission('app.settings.subscription.delete', tenantId)
    const tenantSubscriptionProductId = form.get('tenant-subscription-product-id')?.toString() ?? ''
    const tenantSubscriptionProduct = await db.tenantSubscriptionProduct.get(
      tenantSubscriptionProductId,
    )
    if (!tenantSubscriptionProduct?.stripeSubscriptionId) {
      return { error: 'Not subscribed' }
    }
    await stripeService.cancelStripeSubscription(tenantSubscriptionProduct?.stripeSubscriptionId)
    const stripeSubscription = await stripeService.getStripeSubscription(
      tenantSubscriptionProduct.stripeSubscriptionId,
    )
    await cancelTenantSubscriptionProduct(tenantSubscriptionProduct.id, {
      cancelledAt: new Date(),
      endsAt: stripeSubscription?.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : new Date(),
    })
    revalidatePath(`/app/${tenantSlug}/settings/subscription`)
    return {
      success: 'Successfully cancelled',
    }
  } else if (action === 'add-payment-method') {
    const session = await stripeService.createStripeSetupSession(
      tenantSubscription.stripeCustomerId,
    )
    return redirect(session?.url ?? '')
  } else if (action === 'delete-payment-method') {
    await stripeService.deleteStripePaymentMethod(form.get('id')?.toString() ?? '')
    return {}
  } else if (action === 'open-customer-portal') {
    const session = await stripeService.createCustomerPortalSession(
      tenantSubscription.stripeCustomerId,
    )
    return redirect(session?.url ?? '')
  }
}

export default async function () {
  const data = await loader()
  return <Component data={data} />
}
