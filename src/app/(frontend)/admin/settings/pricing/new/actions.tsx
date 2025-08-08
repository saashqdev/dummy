'use server'

import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { getServerTranslations } from '@/i18n/server'
import { SubscriptionFeatureDto } from '@/modules/subscriptions/dtos/SubscriptionFeatureDto'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import { SubscriptionUsageBasedPriceDto } from '@/modules/subscriptions/dtos/SubscriptionUsageBasedPriceDto'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import { createPlan } from '@/modules/subscriptions/services/PricingService'
import { redirect } from 'next/navigation'

export const actionAdminPricingNew = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.pricing.create')
  const { t } = await getServerTranslations()

  const action = form.get('action')?.toString()

  if (action !== 'create') {
    return { error: t('shared.invalidForm') }
  }
  const order = Number(form.get('order'))
  const title = form.get('title')?.toString()
  const description = form.get('description')?.toString() ?? ''
  const model = Number(form.get('model'))
  const badge = form.get('badge')?.toString() ?? ''
  const groupTitle = form.get('group-title')?.toString() ?? ''
  const groupDescription = form.get('group-description')?.toString() ?? ''
  const isPublic = Boolean(form.get('is-public'))
  const isBillingRequired = Boolean(form.get('is-billing-required'))
  const hasQuantity = Boolean(form.get('has-quantity'))
  const canBuyAgain = Boolean(form.get('can-buy-again'))

  const featuresArr = form.getAll('features[]')
  const features: SubscriptionFeatureDto[] = featuresArr.map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString())
  })

  const prices: {
    billingPeriod: SubscriptionBillingPeriod
    price: number
    currency: string
    trialDays?: number
  }[] = form.getAll('prices[]').map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString())
  })

  const oneTimePricesWithZero = prices.filter(
    (p) => p.billingPeriod === SubscriptionBillingPeriod.ONCE && p.price === 0,
  )
  if (oneTimePricesWithZero.length > 0) {
    return { error: "One-time prices can't be zero" }
  }

  const usageBasedPrices: SubscriptionUsageBasedPriceDto[] = form
    .getAll('usage-based-prices[]')
    .map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString())
    })

  if (!title) {
    return { error: 'Plan title required' }
  }

  const plan: SubscriptionProductDto = {
    stripe_id: '',
    order,
    title,
    model,
    description,
    badge,
    group_title: groupTitle,
    group_description: groupDescription,
    active: true,
    public: isPublic,
    prices: [],
    features: [],
    usageBasedPrices,
    billing_address_collection: isBillingRequired ? 'required' : 'auto',
    has_quantity: hasQuantity,
    can_buy_again: canBuyAgain,
  }

  const mappedPrices = prices.map((p) => ({
    billing_period: p.billingPeriod,
    price: p.price,
    currency: p.currency,
    trial_days: p.trialDays,
  }))
  const response = await createPlan(plan, mappedPrices, features, usageBasedPrices, t).catch(
    (e) => {
      return { error: e.message }
    },
  )
  if (response && 'error' in response) {
    return { error: response.error }
  }
  return redirect('/admin/settings/pricing')
}
