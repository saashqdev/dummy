import payload from 'payload'
import { eq } from 'drizzle-orm'
import { subscription_feature } from '@/db/schema'
import { ISubscriptionFeatureDb } from '@/db/interfaces/subscriptions/ISubscriptionFeatureDb'
import { SubscriptionFeatureModel } from '@/db/models'
import { SubscriptionFeatureLimitType } from '@/modules/subscriptions/enums/SubscriptionFeatureLimitType'
import { createId } from '@paralleldrive/cuid2'

export class SubscriptionFeatureDbDrizzle implements ISubscriptionFeatureDb {
  async getAll(): Promise<SubscriptionFeatureModel[]> {
    return await payload.db.tables.subscription_feature.findMany()
  }

  async get(id: string): Promise<SubscriptionFeatureModel | null> {
    const items = await payload.db.tables.subscription_feature.findMany({
      where: eq(subscription_feature.id, id),
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
    await payload.db.tables.insert(subscription_feature).values({
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
    await payload.db.tables
      .delete(subscription_feature)
      .where(eq(subscription_feature.subscription_product_id, subscription_product_id))
  }
}
