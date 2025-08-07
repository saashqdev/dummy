export type CheckoutSessionStatusModel = {
  id: string
  created_at: Date
  updated_at: Date
  pending: boolean
  email: string
  from_url: string
  from_userId: string | null
  from_tenant_id: string | null
  created_userId: string | null
  created_tenant_id: string | null
}
