import { createId } from '@paralleldrive/cuid2'
import { eq } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { TenantSubscription, TenantSubscriptionUsageRecord } from '@/db/config/drizzle/schema'
import { ITenantSubscriptionDb } from '@/db/interfaces/subscriptions/ITenantSubscriptionDb'
import { TenantSubscriptionWithDetailsDto } from '@/db/models'

export class TenantSubscriptionDbDrizzle implements ITenantSubscriptionDb {
  async getAll(): Promise<TenantSubscriptionWithDetailsDto[]> {
    return await drizzleDb.query.TenantSubscription.findMany({
      with: {
        products: {
          with: {
            subscription_product: {
              with: {
                features: true,
              },
            },
            prices: {
              with: {
                subscription_price: true,
                subscription_usage_based_price: {
                  with: {
                    tiers: true,
                  },
                },
              },
            },
          },
          orderBy: (products, { desc }) => [desc(products.created_at)],
        },
      },
    })
  }

  async get(tenant_id: string): Promise<TenantSubscriptionWithDetailsDto | null> {
    const subscriptions = await drizzleDb.query.TenantSubscription.findMany({
      where: eq(TenantSubscription.tenant_id, tenant_id),
      with: {
        products: {
          with: {
            subscription_product: {
              with: {
                features: true,
              },
            },
            prices: {
              with: {
                subscription_price: true,
                subscription_usage_based_price: true,
              },
            },
          },
          orderBy: (products, { desc }) => [desc(products.created_at)],
        },
      },
    })

    return subscriptions.length > 0 ? subscriptions[0] : null
  }

  async create(data: { tenant_id: string; stripe_customer_id: string }): Promise<string> {
    const id = createId()
    const [result] = await drizzleDb
      .insert(TenantSubscription)
      .values({
        id,
        tenant_id: data.tenant_id,
        stripe_customer_id: data.stripe_customer_id,
      })
      .returning({ tenant_id: TenantSubscription.tenant_id })

    return result.tenant_id
  }

  async update(tenant_id: string, data: { stripe_customer_id: string }): Promise<void> {
    await drizzleDb
      .update(TenantSubscription)
      .set({
        stripe_customer_id: data.stripe_customer_id,
      })
      .where(eq(TenantSubscription.tenant_id, tenant_id))
  }

  async createUsageRecord(data: {
    tenant_subscription_product_price_id: string
    timestamp: number
    quantity: number
    stripe_subscription_item_id: string
  }): Promise<string> {
    const id = createId()
    const [result] = await drizzleDb
      .insert(TenantSubscriptionUsageRecord)
      .values({
        id,
        tenant_subscription_product_price_id: data.tenant_subscription_product_price_id,
        timestamp: data.timestamp,
        quantity: data.quantity,
        stripe_subscription_item_id: data.stripe_subscription_item_id,
      })
      .returning({ id: TenantSubscriptionUsageRecord.id })

    return result.id
  }
}
