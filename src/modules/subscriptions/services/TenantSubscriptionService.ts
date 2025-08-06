import { db } from '@/db'
import { TenantSubscriptionWithDetailsDto } from '@/db/models'
import { clearCacheKey } from '@/lib/services/cache.server'
import { clearSubscriptionsCache } from './SubscriptionService'

export async function getOrPersistTenantSubscription(
  tenantId: string,
): Promise<TenantSubscriptionWithDetailsDto> {
  const subscription = await db.tenantSubscription.get(tenantId)

  if (subscription) {
    return subscription
  }
  const id = await createTenantSubscription(tenantId, '')
  const item = await db.tenantSubscription.get(id)
  if (!item) {
    throw new Error('Could not create tenant subscription')
  }
  return item
}

export async function createTenantSubscription(
  tenantId: string,
  stripe_customer_id: string,
): Promise<string> {
  const id = await db.tenantSubscription
    .create({
      tenantId,
      stripe_customer_id,
    })
    .then((item) => {
      clearCacheKey(`tenantSubscription:${tenantId}`)
      return item
    })
  return id
}

export async function updateTenantSubscription(
  tenantId: string,
  data: { stripe_customer_id: string },
): Promise<void> {
  await db.tenantSubscription
    .update(tenantId, {
      stripe_customer_id: data.stripe_customer_id,
    })
    .then((item) => {
      clearCacheKey(`tenantSubscription:${tenantId}`)
      return item
    })
}

export async function createTenantSubscriptionProduct(data: {
  tenant_subscription_id: string
  subscription_product_id: string
  stripe_subscription_id?: string
  quantity?: number
  from_checkout_session_id?: string | null
  prices: {
    subscription_price_id?: string
    subscription_usage_based_price_id?: string
  }[]
}): Promise<string> {
  const id = await db.tenantSubscriptionProduct
    .create({
      tenant_subscription_id: data.tenant_subscription_id,
      subscription_product_id: data.subscription_product_id,
      stripe_subscription_id: data.stripe_subscription_id,
      quantity: data.quantity,
      from_checkout_session_id: data.from_checkout_session_id,
      prices: data.prices.map((price) => ({
        subscription_price_id: price.subscription_price_id,
        subscription_usage_based_price_id: price.subscription_usage_based_price_id,
      })),
    })
    .then(async (id) => {
      const tenantSubscription = await db.tenantSubscription.get(data.tenant_subscription_id)
      if (tenantSubscription) {
        clearCacheKey(`tenantSubscription:${tenantSubscription.tenantId}`)
      }
      return id
    })
  return id
}

export async function cancelTenantSubscriptionProduct(
  id: string,
  data: { cancelled_at: Date | null; ends_at: Date | null },
): Promise<void> {
  await clearSubscriptionsCache()
  return await db.tenantSubscriptionProduct
    .update(id, {
      cancelled_at: data.cancelled_at,
      ends_at: data.ends_at,
    })
    .then(async () => {
      const tenantSubscriptionProduct = await db.tenantSubscriptionProduct.get(id)
      if (tenantSubscriptionProduct?.tenant_subscription_id) {
        const tenantSubscription = await db.tenantSubscription.get(
          tenantSubscriptionProduct?.tenant_subscription_id,
        )
        if (tenantSubscription?.tenantId) {
          clearCacheKey(`tenantSubscription:${tenantSubscription.tenantId}`)
        }
      }
    })
}
