'use server'

import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { getServerTranslations } from '@/i18n/server'
import { SubscriptionFeatureDto } from '@/modules/subscriptions/dtos/SubscriptionFeatureDto'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import { deletePlan, updatePlan } from '@/modules/subscriptions/services/PricingService'
import { redirect } from 'next/navigation'
import { db } from '@/db'

export const actionAdminPricingEdit = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.pricing.update')
  const { t } = await getServerTranslations()

  const action = form.get('action')?.toString()
  const id = form.get('id')?.toString() || ''
  if (!id) {
    return { error: 'ID required' }
  }
  const item = await db.subscription_product.getSubscriptionProduct(id)
  if (!item) {
    return { error: t('shared.notFound') }
  }
  if (action === 'edit') {
    const order = Number(form.get('order'))
    const title = form.get('title')?.toString()
    const description = form.get('description')?.toString() ?? ''
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

    if (!title) {
      return { error: 'Title required' }
    }

    const plan: SubscriptionProductDto = {
      id,
      stripe_id: '',
      order,
      title,
      description,
      badge,
      group_title: groupTitle,
      group_description: groupDescription,
      active: true,
      model: item.model,
      public: isPublic,
      prices: [],
      usageBasedPrices: [],
      features: [],
      billing_address_collection: isBillingRequired ? 'required' : 'auto',
      has_quantity: hasQuantity,
      can_buy_again: canBuyAgain,
    }

    const response = await updatePlan(plan, features).catch((e: any) => ({ error: e?.toString() }))
    if (response && 'error' in response) {
      return { error: response.error }
    }
    return redirect('/admin/settings/pricing')
  } else if (action === 'delete') {
    await verifyUserHasPermission('admin.pricing.delete')
    if (!item) {
      return { error: 'Pricing plan not found' }
    }
    const response = await deletePlan(item).catch((e: any) => ({ error: e?.toString() }))
    if (response && 'error' in response) {
      return { error: response.error }
    }
    return redirect('/admin/settings/pricing')
  } else {
    return { error: t('shared.invalidForm') }
  }
}
