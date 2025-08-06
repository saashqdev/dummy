import { SubscriptionFeatureModel } from './SubscriptionFeatureModel'
import { SubscriptionPriceModel } from './SubscriptionPriceModel'
import { SubscriptionProductModel } from './SubscriptionProductModel'
import { SubscriptionUsageBasedPriceModel } from './SubscriptionUsageBasedPriceModel'
import { SubscriptionUsageBasedTierModel } from './SubscriptionUsageBasedTierModel'
import { TenantSubscriptionProductPriceModel } from './TenantSubscriptionProductPrice'

export type TenantSubscriptionProductModel = {
  id: string
  created_at: Date
  tenant_subscription_id: string
  subscription_product_id: string
  cancelled_at: Date | null
  ends_at: Date | null
  stripe_subscription_id: string | null
  quantity: number | null
  from_checkout_session_id: string | null
  current_period_start: Date | null
  current_period_end: Date | null
}

export type TenantSubscriptionProductWithDetailsDto = TenantSubscriptionProductModel & {
  subscription_product: SubscriptionProductModel & { features: SubscriptionFeatureModel[] }
  prices: (TenantSubscriptionProductPriceModel & {
    subscription_price: SubscriptionPriceModel | null
    subscription_usage_based_price: SubscriptionUsageBasedPriceModel | null
    // | (SubscriptionUsageBasedPriceModel & {
    //     tiers: SubscriptionUsageBasedTierModel[];
    //   })
    // | null;
  })[]
}
