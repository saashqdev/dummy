import { eq } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { SubscriptionFeature } from '@/db/config/drizzle/schema'
import { ISubscriptionFeatureDb } from '@/db/interfaces/subscriptions/ISubscriptionFeatureDb'
import { SubscriptionFeatureModel } from '@/db/models'
import { SubscriptionFeatureLimitType } from '@/modules/subscriptions/enums/SubscriptionFeatureLimitType'
import { createId } from '@paralleldrive/cuid2'

export class SubscriptionFeatureDbDrizzle implements ISubscriptionFeatureDb {
  async getAll(): Promise<SubscriptionFeatureModel[]> {
    return await drizzleDb.query.SubscriptionFeature.findMany()
  }

  async get(id: string): Promise<SubscriptionFeatureModel | null> {
    const items = await drizzleDb.query.SubscriptionFeature.findMany({
      where: eq(SubscriptionFeature.id, id),
    })
    return items.length > 0 ? items[0] : null
  }

  async create(
    subscription_product_id: string,
    data: {
      order: number
      title: string
      name: string
      type: SubscriptionFeatureLimitType
      value: number
      href?: string | null
      badge?: string | null
      accumulate?: boolean
    },
  ): Promise<string> {
    const id = createId()
    await drizzleDb.insert(SubscriptionFeature).values({
      id,
      subscription_product_id,
      order: data.order,
      title: data.title,
      name: data.name,
      type: data.type,
      value: data.value,
      href: data.href ?? null,
      badge: data.badge ?? null,
      accumulate: data.accumulate ?? false,
    })
    return id
  }

  async deleteBySubscriptionProductId(subscription_product_id: string): Promise<void> {
    await drizzleDb
      .delete(SubscriptionFeature)
      .where(eq(SubscriptionFeature.subscription_product_id, subscription_product_id))
  }
}
