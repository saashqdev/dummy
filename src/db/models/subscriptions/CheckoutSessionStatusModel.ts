export type CheckoutSessionStatusModel = {
  id: string
  created_at: Date
  updated_at: Date
  pending: boolean
  email: string
  from_url: string
  from_user_id: string | null
  from_tenant_id: string | null
  created_user_id: string | null
  created_tenant_id: string | null
}
