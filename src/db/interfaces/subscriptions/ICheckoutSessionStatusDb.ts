import { CheckoutSessionStatusModel } from '@/db/models'

export interface ICheckoutSessionStatusDb {
  get(id: string): Promise<CheckoutSessionStatusModel | null>
  create(data: {
    id: string
    email: string
    from_url: string
    from_user_id?: string | null
    from_tenant_id?: string | null
  }): Promise<string>
  update(
    id: string,
    data: { pending: boolean; created_user_id?: string | null; created_tenant_id?: string | null },
  ): Promise<void>
}
