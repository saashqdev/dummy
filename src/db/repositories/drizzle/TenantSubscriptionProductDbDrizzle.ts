import payload from 'payload'
import { eq } from 'drizzle-orm'
import { tenant_subscription_product, tenant_subscription_product_price } from '@/db/schema'
import { ITenantSubscriptionProductDb } from '@/db/interfaces/subscriptions/ITenantSubscriptionProductDb'
import { TenantSubscriptionProductModel } from '@/db/models'
import { createId } from '@paralleldrive/cuid2'

export class TenantSubscriptionProductDbDrizzle implements ITenantSubscriptionProductDb {
  async get(id: string): Promise<TenantSubscriptionProductModel | null> {
    const results = await payload.db.tables
      .select()
      .from(tenant_subscription_product)
      .where(eq(tenant_subscription_product.id, id))
    return results[0] || null
  }

  async getByStripeSubscriptionId(
    stripe_subscription_id: string,
  ): Promise<TenantSubscriptionProductModel | null> {
    const results = await payload.db.tables
      .select()
      .from(tenant_subscription_product)
      .where(eq(tenant_subscription_product.stripe_subscription_id, stripe_subscription_id))
    return results[0] || null
  }

  async create(data: {
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
    const id = createId()
    interface TenantSubscriptionProductPriceInput {
      subscription_price_id?: string
      subscription_usage_based_price_id?: string
    }

    await payload.db.tables.transaction(async (tx: typeof payload.db.tables) => {
      await tx.insert(tenant_subscription_product).values({
        id,
        tenant_subscription_id: data.tenant_subscription_id,
        subscription_product_id: data.subscription_product_id,
        stripe_subscription_id: data.stripe_subscription_id,
        quantity: data.quantity,
        from_checkout_session_id: data.from_checkout_session_id,
        ends_at: null,
        cancelled_at: null,
        created_at: new Date(),
      })

      for (const price of data.prices as TenantSubscriptionProductPriceInput[]) {
        await tx.insert(tenant_subscription_product_price).values({
          id: createId(),
          tenant_subscription_product_id: id,
          subscription_price_id: price.subscription_price_id,
          subscription_usage_based_price_id: price.subscription_usage_based_price_id,
          // created_at: new Date(),
        })
      }
    })

    return id
  }

  async update(
    id: string,
    data: {
      cancelled_at?: Date | null
      ends_at?: Date | null
      current_period_start?: Date | null
      current_period_end?: Date | null
    },
  ): Promise<void> {
    await payload.db.tables
      .update(tenant_subscription_product)
      .set({
        cancelled_at: data.cancelled_at,
        ends_at: data.ends_at,
        current_period_start: data.current_period_start,
        current_period_end: data.current_period_end,
        // updated_at: new Date(),
      })
      .where(eq(tenant_subscription_product.id, id))
  }
}
