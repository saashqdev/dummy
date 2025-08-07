import payload from 'payload'
import { and, eq, inArray, asc } from 'drizzle-orm'
import {
  subscription_product,
  subscription_price,
  subscription_usage_based_price,
  subscription_usage_based_tier,
  subscription_feature,
} from '@/db/schema'
import { ISubscriptionProductDb } from '@/db/interfaces/subscriptions/ISubscriptionProductDb'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import { PricingModel } from '@/modules/subscriptions/enums/PricingModel'
import {
  SubscriptionPriceModel,
  SubscriptionProductModel,
  SubscriptionUsageBasedPriceModel,
  SubscriptionUsageBasedTierModel,
} from '@/db/models'
import { createId } from '@paralleldrive/cuid2'

export class SubscriptionProductDbDrizzle implements ISubscriptionProductDb {
  async getAllSubscriptionProductsWithTenants(): Promise<SubscriptionProductDto[]> {
    return await payload.db.tables.subscription_product.findMany({
      with: {
        tenantProducts: true,
        usageBasedPrices: {
          with: {
            tiers: { orderBy: asc(subscription_usage_based_tier.from) },
          },
        },
        prices: true,
        features: {
          orderBy: asc(subscription_feature.order),
        },
      },
      orderBy: asc(subscription_product.order),
    })
  }

  async getAllSubscriptionProducts(is_public?: boolean): Promise<SubscriptionProductDto[]> {
    let whereClause: any = eq(subscription_product.active, true)
    if (is_public) {
      whereClause = and(whereClause, eq(subscription_product.public, true))
    }

    return await payload.db.tables.subscription_product.findMany({
      where: whereClause,
      with: {
        tenantProducts: true,
        usageBasedPrices: {
          with: {
            tiers: { orderBy: asc(subscription_usage_based_tier.from) },
          },
        },
        prices: true,
        features: {
          orderBy: asc(subscription_feature.order),
        },
      },
      orderBy: asc(subscription_product.order),
    })
  }

  async getSubscriptionProductsInIds(ids: string[]): Promise<SubscriptionProductDto[]> {
    return await payload.db.tables.subscription_product.findMany({
      where: inArray(subscription_product.id, ids),
      with: {
        tenantProducts: true,
        usageBasedPrices: {
          with: {
            tiers: { orderBy: asc(subscription_usage_based_tier.from) },
          },
        },
        prices: true,
        features: {
          orderBy: asc(subscription_feature.order),
        },
      },
      orderBy: asc(subscription_product.order),
    })
  }

  async getSubscriptionProduct(id: string): Promise<SubscriptionProductDto | null> {
    const products = await payload.db.tables.subscription_product.findMany({
      where: eq(subscription_product.id, id),
      with: {
        tenantProducts: true,
        usageBasedPrices: {
          with: {
            tiers: { orderBy: asc(subscription_usage_based_tier.from) },
          },
        },
        prices: true,
        features: {
          orderBy: asc(subscription_feature.order),
        },
      },
    })
    return products[0] || null
  }

  async getSubscriptionPriceByStripeId(stripe_id: string): Promise<SubscriptionPriceModel | null> {
    const prices = await payload.db.tables.subscription_price.findMany({
      where: eq(subscription_price.stripe_id, stripe_id),
      with: {
        subscription_product: true,
      },
    })
    return prices[0] || null
  }

  async getSubscriptionUsageBasedPriceByStripeId(
    stripe_id: string,
  ): Promise<SubscriptionUsageBasedPriceModel | null> {
    const prices = await payload.db.tables.subscription_usage_based_price.findMany({
      where: eq(subscription_usage_based_price.stripe_id, stripe_id),
    })
    return prices[0] || null
  }

  async createSubscriptionProduct(
    data: Omit<SubscriptionProductModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await payload.db.tables.insert(subscription_product).values({
      id,
      ...data,
    })
    return id
  }

  async updateSubscriptionProduct(
    id: string,
    data: {
      stripe_id?: string
      order: number
      title: string
      model: PricingModel
      description?: string | null
      badge?: string | null
      group_title?: string | null
      group_description?: string | null
      public: boolean
      billing_address_collection: string
      has_quantity?: boolean
      can_buy_again?: boolean
    },
  ): Promise<void> {
    await payload.db.tables
      .update(subscription_product)
      .set({
        ...data,
      })
      .where(eq(subscription_product.id, id))
  }

  async updateSubscriptionProductStripeId(id: string, data: { stripe_id: string }): Promise<void> {
    await payload.db.tables
      .update(subscription_product)
      .set({
        stripe_id: data.stripe_id,
      })
      .where(eq(subscription_product.id, id))
  }

  async updateSubscriptionPriceStripeId(id: string, data: { stripe_id: string }): Promise<void> {
    await payload.db.tables
      .update(subscription_price)
      .set({
        stripe_id: data.stripe_id,
      })
      .where(eq(subscription_price.id, id))
  }

  async createSubscriptionPrice(
    data: Omit<SubscriptionPriceModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await payload.db.tables.insert(subscription_price).values({
      id,
      ...data,
    })
    return id
  }

  async getSubscriptionUsageBasedPrice(
    id: string,
  ): Promise<SubscriptionUsageBasedPriceModel | null> {
    const prices = await payload.db.tables.subscription_usage_based_price.findMany({
      where: eq(subscription_usage_based_price.id, id),
    })
    return prices[0] || null
  }

  async createSubscriptionUsageBasedPrice(
    data: Omit<SubscriptionUsageBasedPriceModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await payload.db.tables.insert(subscription_usage_based_price).values({
      id,
      ...data,
    })
    return id
  }

  async createSubscriptionUsageBasedTier(
    data: Omit<SubscriptionUsageBasedTierModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await payload.db.tables.insert(subscription_usage_based_tier).values({
      id,
      ...data,
    })
    return id
  }

  async deleteSubscriptionProduct(id: string): Promise<void> {
    await payload.db.tables.delete(subscription_product).where(eq(subscription_product.id, id))
  }

  async deleteSubscriptionPrice(id: string): Promise<void> {
    await payload.db.tables.delete(subscription_price).where(eq(subscription_price.id, id))
  }

  async deleteSubscriptionUsageBasedTier(id: string): Promise<void> {
    await payload.db.tables
      .delete(subscription_usage_based_tier)
      .where(eq(subscription_usage_based_tier.id, id))
  }

  async deleteSubscriptionUsageBasedPrice(id: string): Promise<void> {
    await payload.db.tables
      .delete(subscription_usage_based_price)
      .where(eq(subscription_usage_based_price.id, id))
  }
}
