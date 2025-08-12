'use server'

import { getBaseURL, getCurrentUrl } from '@/lib/services/url.server'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { getPlanFromForm } from '@/modules/subscriptions/services/SubscriptionService'
import {
  getOrPersistTenantSubscription,
  updateTenantSubscription,
} from '@/modules/subscriptions/services/TenantSubscriptionService'
import { getServerTranslations } from '@/i18n/server'
import { getUserInfo } from '@/lib/services/session.server'
import { getTenant, getTenantIdFromUrl } from '@/modules/accounts/services/TenantService'
import { requireAuth } from '@/lib/services/loaders.middleware'
import { getUser } from '@/modules/accounts/services/UserService'
import { stripeService } from '@/modules/subscriptions/services/StripeService'
import { redirect } from 'next/navigation'

export const actionAppSubscribeTenant = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations()
  const userInfo = await getUserInfo()

  const tenantSlug = form.get('tenantSlug')?.toString()
  const tenantId = await getTenantIdFromUrl(tenantSlug || '')
  if (!tenantId) {
    return { error: 'Invalid tenant ID' }
  }
  await requireAuth({ tenantSlug })
  verifyUserHasPermission('app.settings.subscription.update', tenantId)

  const tenantSubscription = await getOrPersistTenantSubscription(tenantId)
  const user = await getUser(userInfo.userId!)
  const tenant = await getTenant(tenantId)

  if (!tenantSubscription.stripe_customer_id && user && tenant) {
    const customer = await stripeService.createStripeCustomer(user.email, tenant.name)
    if (customer) {
      tenantSubscription.stripe_customer_id = customer.id
      await updateTenantSubscription(tenant.id, {
        stripe_customer_id: customer.id,
      })
    }
  }

  const action = form.get('action')

  if (!tenantSubscription || !tenantSubscription?.stripe_customer_id) {
    return { error: 'Invalid stripe customer' }
  }

  if (action === 'subscribe') {
    const selectedPlan = await getPlanFromForm(form)
    const response = await stripeService
      .createStripeCheckoutSession({
        subscription_product: selectedPlan.product,
        customer: tenantSubscription.stripe_customer_id,
        line_items: selectedPlan.line_items,
        mode: selectedPlan.mode,
        success_url: `${await getBaseURL()}/subscribe/${tenantSlug}/{CHECKOUT_SESSION_ID}/success`,
        cancel_url: `${await getCurrentUrl()}`,
        freeTrialDays: selectedPlan.freeTrialDays,
        coupon: selectedPlan.coupon,
        referral: selectedPlan.referral,
      })
      .then((session) => {
        return session
      })
      .catch((e) => {
        console.log(e)
        return { error: e.message }
      })
    if ('error' in response) {
      return { error: response.error }
    }
    return redirect(response.url ?? '')
  }
}
