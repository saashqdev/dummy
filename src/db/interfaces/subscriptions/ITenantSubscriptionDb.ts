import { TenantSubscriptionWithDetailsDto } from '../../models'

export interface ITenantSubscriptionDb {
  getAll(): Promise<TenantSubscriptionWithDetailsDto[]>
  get(tenant_id: string): Promise<TenantSubscriptionWithDetailsDto | null>
  create(data: { tenant_id: string; stripe_customer_id: string }): Promise<string>
  update(tenant_id: string, data: { stripe_customer_id: string }): Promise<void>
  createUsageRecord(data: {
    tenant_subscription_product_price_id: string
    timestamp: number
    quantity: number
    stripe_subscription_item_id: string
  }): Promise<string>
}
