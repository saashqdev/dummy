export type SubscriptionUsageBasedPriceModel = {
  id: string
  subscription_product_id: string
  stripe_id: string
  billing_period: number
  currency: string
  unit: string
  unit_title: string
  unit_title_plural: string
  usage_type: string
  aggregate_usage: string
  tiers_mode: string
  billing_scheme: string
}
