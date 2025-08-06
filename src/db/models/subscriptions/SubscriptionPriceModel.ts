export type SubscriptionPriceModel = {
  id: string
  subscription_product_id: string
  stripe_id: string
  type: number
  billing_period: number
  price: number
  currency: string
  trial_days: number
  active: boolean
}
