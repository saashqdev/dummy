export type SubscriptionFeatureModel = {
  id: string
  subscription_product_id: string
  order: number
  title: string
  name: string
  type: number
  value: number
  href: string | null
  badge: string | null
  accumulate: boolean
}
