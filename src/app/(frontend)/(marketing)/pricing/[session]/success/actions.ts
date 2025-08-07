'use server'

import { TenantWithDetailsDto, UserDto } from '@/db/models'
import { getServerTranslations } from '@/i18n/server'
import { createUserSession, getUserInfo } from '@/lib/services/session.server'
import { validateRegistration } from '@/modules/accounts/services/AuthService'
import AuthUtils from '@/modules/accounts/utils/AuthUtils'
import {
  addTenantProductsFromCheckoutSession,
  getAcquiredItemsFromCheckoutSession,
} from '@/modules/subscriptions/services/PricingService'

export const actionPricingSuccess = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations()
  const userInfo = await getUserInfo()

  const session = form.get('checkoutSessionId')?.toString()
  const checkoutSession = await getAcquiredItemsFromCheckoutSession(session ?? '')
  if (!checkoutSession) {
    return { error: t('settings.subscription.checkout.invalid') }
  } else if (!checkoutSession.status?.pending) {
    return { error: t('settings.subscription.checkout.alreadyProcessed') }
  } else if (!checkoutSession.customer?.id) {
    return { error: t('settings.subscription.checkout.invalidCustomer') }
  }

  let registered: { user: UserDto; tenant: TenantWithDetailsDto } | null = null
  try {
    const registrationData = await AuthUtils.getRegistrationFormData(form)
    const result = await validateRegistration({
      registrationData,
      addToTrialOrFreePlan: false,
      checkEmailVerification: false,
      stripeCustomerId: checkoutSession.customer.id,
    })
    if (!result.registered) {
      return { error: t('shared.unknownError') }
    }
    const tenantId = result.registered.tenant.id
    await addTenantProductsFromCheckoutSession({
      tenantId,
      user: result.registered.user,
      checkoutSession,
      createdUserId: result.registered.user.id,
      created_tenant_id: result.registered.tenant.id,
      t,
    })
    await Promise.all(
      checkoutSession.products.map(async (product) => {
        // await createLog(request, tenantId, "Subscribed", t(product.title ?? ""));
      }),
    )
    registered = result.registered
  } catch (e: any) {
    return { error: e.message }
  }
  if (!registered) {
    return { error: t('shared.unknownError') }
  }
  return await createUserSession(
    {
      ...userInfo,
      userId: registered.user.id,
    },
    `/app/${registered.tenant.slug}/dashboard`,
  )
}
