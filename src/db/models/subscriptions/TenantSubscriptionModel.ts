import { TenantSubscriptionProductWithDetailsDto } from './TenantSubscriptionProductModel'

export type TenantSubscriptionModel = {
  id: string
  tenant_id: string
  stripe_customer_id: string | null
}

export type TenantSubscriptionWithDetailsDto = TenantSubscriptionModel & {
  products: TenantSubscriptionProductWithDetailsDto[]
}
