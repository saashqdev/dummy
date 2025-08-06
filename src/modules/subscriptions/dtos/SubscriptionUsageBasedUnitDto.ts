export type SubscriptionUsageBasedUnitDto = {
  unit: string
  unit_title: string
  unit_title_plural: string
  usage_type: string
  aggregate_usage: string
  tiers_mode: string
  billing_scheme: string
  tiers: { from: number; to?: number }[]
  prices: {
    currency: string
    from: number
    to: number | undefined
    per_unit_price?: number | undefined
    flat_fee_price?: number | undefined
  }[]
}
