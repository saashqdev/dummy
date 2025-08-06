import { TenantSubscriptionProductWithDetailsDto } from './TenantSubscriptionProductModel'

export type SubscriptionProductModel = {
  id: string
  stripe_id: string
  order: number
  title: string
  active: boolean
  model: number
  public: boolean
  group_title: string | null
  group_description: string | null
  description: string | null
  badge: string | null
  billing_address_collection: string
  has_quantity: boolean
  can_buy_again: boolean
}

export type SubscriptionProductWithDetailsDto = SubscriptionProductModel & {
  products: TenantSubscriptionProductWithDetailsDto[]
}
