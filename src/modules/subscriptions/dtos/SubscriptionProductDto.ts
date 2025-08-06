import { SubscriptionPriceDto } from './SubscriptionPriceDto'
import { SubscriptionFeatureDto } from './SubscriptionFeatureDto'
import { PricingModel } from '@/modules/subscriptions/enums/PricingModel'
import { SubscriptionUsageBasedPriceDto } from './SubscriptionUsageBasedPriceDto'
import { TenantSubscriptionProductModel } from '@/db/models'

export interface SubscriptionProductDto {
  id?: string
  stripe_id: string
  order: number
  title: string
  description: string | null
  group_title?: string | null
  group_description?: string | null
  badge: string | null
  active: boolean
  model: PricingModel
  public: boolean
  prices: SubscriptionPriceDto[]
  features: SubscriptionFeatureDto[]
  translatedTitle?: string
  usageBasedPrices?: SubscriptionUsageBasedPriceDto[]
  tenantProducts?: TenantSubscriptionProductModel[]
  billing_address_collection?: string | null
  has_quantity?: boolean
  can_buy_again?: boolean
}
