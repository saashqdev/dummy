import { TenantSubscriptionProductModel } from '../../models'

export interface ITenantSubscriptionProductDb {
  get(id: string): Promise<TenantSubscriptionProductModel | null>

  getByStripeSubscriptionId(
    stripe_subscription_id: string,
  ): Promise<TenantSubscriptionProductModel | null>

  create(data: {
    tenant_subscription_id: string
    subscription_product_id: string
    stripe_subscription_id?: string
    quantity?: number
    from_checkout_session_id?: string | null
    prices: {
      subscription_price_id?: string
      subscription_usage_based_price_id?: string
    }[]
  }): Promise<string>

  update(
    id: string,
    data: {
      cancelled_at?: Date | null
      ends_at?: Date | null
      current_period_start?: Date | null
      current_period_end?: Date | null
    },
  ): Promise<void>
}
