import {
  SubscriptionPriceModel,
  SubscriptionProductModel,
  SubscriptionUsageBasedPriceModel,
  SubscriptionUsageBasedTierModel,
} from '@/db/models'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import { PricingModel } from '@/modules/subscriptions/enums/PricingModel'

export interface ISubscriptionProductDb {
  getAllSubscriptionProductsWithTenants(): Promise<SubscriptionProductDto[]>

  getAllSubscriptionProducts(is_public?: boolean): Promise<SubscriptionProductDto[]>

  getSubscriptionProductsInIds(ids: string[]): Promise<SubscriptionProductDto[]>

  getSubscriptionProduct(id: string): Promise<SubscriptionProductDto | null>

  getSubscriptionPriceByStripeId(stripe_id: string): Promise<SubscriptionPriceModel | null>

  getSubscriptionUsageBasedPriceByStripeId(
    stripe_id: string,
  ): Promise<SubscriptionUsageBasedPriceModel | null>

  createSubscriptionProduct(
    data: Omit<SubscriptionProductModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string>

  updateSubscriptionProduct(
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
  ): Promise<void>

  updateSubscriptionProductStripeId(id: string, data: { stripe_id: string }): Promise<void>

  updateSubscriptionPriceStripeId(id: string, data: { stripe_id: string }): Promise<void>

  createSubscriptionPrice(
    data: Omit<SubscriptionPriceModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string>

  getSubscriptionUsageBasedPrice(id: string): Promise<SubscriptionUsageBasedPriceModel | null>

  createSubscriptionUsageBasedPrice(
    data: Omit<SubscriptionUsageBasedPriceModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string>

  createSubscriptionUsageBasedTier(
    data: Omit<SubscriptionUsageBasedTierModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string>

  deleteSubscriptionProduct(id: string): Promise<void>

  deleteSubscriptionPrice(id: string): Promise<void>

  deleteSubscriptionUsageBasedTier(id: string): Promise<void>

  deleteSubscriptionUsageBasedPrice(id: string): Promise<void>
}
