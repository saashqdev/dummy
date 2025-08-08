'use server'

import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { getServerTranslations } from '@/i18n/server'
import { PricingModel } from '@/modules/subscriptions/enums/PricingModel'
import { db } from '@/db'
import defaultPlans from '@/modules/subscriptions/data/defaultPlans.server'
import { createPlans, deletePlan, syncPlan } from '@/modules/subscriptions/services/PricingService'
import { revalidatePath } from 'next/cache'

export const actionAdminPricing = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.pricing.update')
  const { t } = await getServerTranslations()

  const action = form.get('action')?.toString()
  if (action === 'create-all-plans') {
    await verifyUserHasPermission('admin.pricing.create')
    const model = Number(form.get('model')) as PricingModel
    const items = await db.subscription_product.getAllSubscriptionProducts()
    if (items.length > 0) {
      return {
        items,
      }
    }

    await Promise.all(
      defaultPlans
        .filter((f) => f.model === model || model === PricingModel.ALL)
        .map(async (plan) => {
          plan.translatedTitle = t(plan.title)
          plan.usageBasedPrices?.forEach((usageBasedPrice) => {
            usageBasedPrice.unit_title = t(usageBasedPrice.unit_title)
            usageBasedPrice.unit_title_plural = t(usageBasedPrice.unit_title_plural)
          })
        }),
    )

    try {
      await createPlans(defaultPlans.filter((f) => f.model === model || model === PricingModel.ALL))
      revalidatePath('/admin/settings/pricing')

      return {
        items: await db.subscription_product.getAllSubscriptionProducts(),
      }
    } catch (e: any) {
      return { error: e?.toString() }
    }
  } else if (action === 'bulk-delete') {
    await verifyUserHasPermission('admin.pricing.delete')
    const ids = form.getAll('ids[]')
    const items = await db.subscription_product.getAllSubscriptionProducts()
    const itemsToDelete = items.filter((f) => ids.includes(f.id?.toString() ?? ''))
    await Promise.all(
      itemsToDelete.map(async (item) => {
        // eslint-disable-next-line no-console
        console.log({
          item: item.title,
          tenantProducts: item.tenantProducts?.map((f) => f.tenant_subscription_id),
        })
        if (item.tenantProducts && item.tenantProducts.length > 0) {
          throw new Error('Cannot delete a plan with active subscriptions: ' + t(item.title))
        }
      }),
    )
    await Promise.all(
      itemsToDelete.map(async (item) => {
        await deletePlan(item)
      }),
    )
    revalidatePath('/admin/settings/pricing')
    return { success: 'Deleted' }
  }
}
