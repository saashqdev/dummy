import { SubscriptionProductDto } from './SubscriptionProductDto'
import { SubscriptionPriceType } from '@/modules/subscriptions/enums/SubscriptionPriceType'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import { SubscriptionUsageBasedTierModel } from '@/db/models'

export interface SubscriptionPriceDto {
  id?: string
  stripe_id: string
  type: SubscriptionPriceType
  billing_period: SubscriptionBillingPeriod
  price: number
  currency: string
  trial_days: number
  active: boolean
  priceBefore?: number
  subscription_product_id: string
  subscription_product?: SubscriptionProductDto
  usageBasedPrices?: SubscriptionUsageBasedTierModel[]
}
