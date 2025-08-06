export type SubscriptionUsageBasedTierModel = {
  id: string
  subscription_usage_based_price_id: string
  from: number
  to: number | null
  per_unit_price: number | null
  flat_fee_price: number | null
}
