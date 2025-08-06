export type TenantSubscriptionUsageRecordModel = {
  id: string
  tenant_subscription_product_price_id: string
  timestamp: number
  quantity: number
  stripe_subscription_item_id: string | null
}
