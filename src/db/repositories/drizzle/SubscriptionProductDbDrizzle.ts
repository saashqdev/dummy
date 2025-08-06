import { and, eq, inArray, desc, asc } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import {
  SubscriptionProduct,
  SubscriptionPrice,
  SubscriptionUsageBasedPrice,
  SubscriptionUsageBasedTier,
  SubscriptionFeature,
} from '@/db/config/drizzle/schema'
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
    return await drizzleDb.query.SubscriptionProduct.findMany({
      with: {
        tenantProducts: true,
        usageBasedPrices: {
          with: {
            tiers: { orderBy: asc(SubscriptionUsageBasedTier.from) },
          },
        },
        prices: true,
        features: {
          orderBy: asc(SubscriptionFeature.order),
        },
      },
      orderBy: asc(SubscriptionProduct.order),
    })
  }

  async getAllSubscriptionProducts(is_public?: boolean): Promise<SubscriptionProductDto[]> {
    let whereClause: any = eq(SubscriptionProduct.active, true)
    if (is_public) {
      whereClause = and(whereClause, eq(SubscriptionProduct.public, true))
    }

    return await drizzleDb.query.SubscriptionProduct.findMany({
      where: whereClause,
      with: {
        tenantProducts: true,
        usageBasedPrices: {
          with: {
            tiers: { orderBy: asc(SubscriptionUsageBasedTier.from) },
          },
        },
        prices: true,
        features: {
          orderBy: asc(SubscriptionFeature.order),
        },
      },
      orderBy: asc(SubscriptionProduct.order),
    })
  }

  async getSubscriptionProductsInIds(ids: string[]): Promise<SubscriptionProductDto[]> {
    return await drizzleDb.query.SubscriptionProduct.findMany({
      where: inArray(SubscriptionProduct.id, ids),
      with: {
        tenantProducts: true,
        usageBasedPrices: {
          with: {
            tiers: { orderBy: asc(SubscriptionUsageBasedTier.from) },
          },
        },
        prices: true,
        features: {
          orderBy: asc(SubscriptionFeature.order),
        },
      },
      orderBy: asc(SubscriptionProduct.order),
    })
  }

  async getSubscriptionProduct(id: string): Promise<SubscriptionProductDto | null> {
    const products = await drizzleDb.query.SubscriptionProduct.findMany({
      where: eq(SubscriptionProduct.id, id),
      with: {
        tenantProducts: true,
        usageBasedPrices: {
          with: {
            tiers: { orderBy: asc(SubscriptionUsageBasedTier.from) },
          },
        },
        prices: true,
        features: {
          orderBy: asc(SubscriptionFeature.order),
        },
      },
    })
    return products[0] || null
  }

  async getSubscriptionPriceByStripeId(stripe_id: string): Promise<SubscriptionPriceModel | null> {
    const prices = await drizzleDb.query.SubscriptionPrice.findMany({
      where: eq(SubscriptionPrice.stripe_id, stripe_id),
      with: {
        subscription_product: true,
      },
    })
    return prices[0] || null
  }

  async getSubscriptionUsageBasedPriceByStripeId(
    stripe_id: string,
  ): Promise<SubscriptionUsageBasedPriceModel | null> {
    const prices = await drizzleDb.query.SubscriptionUsageBasedPrice.findMany({
      where: eq(SubscriptionUsageBasedPrice.stripe_id, stripe_id),
    })
    return prices[0] || null
  }

  async createSubscriptionProduct(
    data: Omit<SubscriptionProductModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await drizzleDb.insert(SubscriptionProduct).values({
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
    await drizzleDb
      .update(SubscriptionProduct)
      .set({
        ...data,
      })
      .where(eq(SubscriptionProduct.id, id))
  }

  async updateSubscriptionProductStripeId(id: string, data: { stripe_id: string }): Promise<void> {
    await drizzleDb
      .update(SubscriptionProduct)
      .set({
        stripe_id: data.stripe_id,
      })
      .where(eq(SubscriptionProduct.id, id))
  }

  async updateSubscriptionPriceStripeId(id: string, data: { stripe_id: string }): Promise<void> {
    await drizzleDb
      .update(SubscriptionPrice)
      .set({
        stripe_id: data.stripe_id,
      })
      .where(eq(SubscriptionPrice.id, id))
  }

  async createSubscriptionPrice(
    data: Omit<SubscriptionPriceModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await drizzleDb.insert(SubscriptionPrice).values({
      id,
      ...data,
    })
    return id
  }

  async getSubscriptionUsageBasedPrice(
    id: string,
  ): Promise<SubscriptionUsageBasedPriceModel | null> {
    const prices = await drizzleDb.query.SubscriptionUsageBasedPrice.findMany({
      where: eq(SubscriptionUsageBasedPrice.id, id),
    })
    return prices[0] || null
  }

  async createSubscriptionUsageBasedPrice(
    data: Omit<SubscriptionUsageBasedPriceModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await drizzleDb.insert(SubscriptionUsageBasedPrice).values({
      id,
      ...data,
    })
    return id
  }

  async createSubscriptionUsageBasedTier(
    data: Omit<SubscriptionUsageBasedTierModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await drizzleDb.insert(SubscriptionUsageBasedTier).values({
      id,
      ...data,
    })
    return id
  }

  async deleteSubscriptionProduct(id: string): Promise<void> {
    await drizzleDb.delete(SubscriptionProduct).where(eq(SubscriptionProduct.id, id))
  }

  async deleteSubscriptionPrice(id: string): Promise<void> {
    await drizzleDb.delete(SubscriptionPrice).where(eq(SubscriptionPrice.id, id))
  }

  async deleteSubscriptionUsageBasedTier(id: string): Promise<void> {
    await drizzleDb.delete(SubscriptionUsageBasedTier).where(eq(SubscriptionUsageBasedTier.id, id))
  }

  async deleteSubscriptionUsageBasedPrice(id: string): Promise<void> {
    await drizzleDb
      .delete(SubscriptionUsageBasedPrice)
      .where(eq(SubscriptionUsageBasedPrice.id, id))
  }
}
