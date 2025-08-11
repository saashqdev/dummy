export type UserRegistrationAttemptModel = {
  id: string
  created_at: Date
  email: string
  firstName: string
  lastName: string
  slug: string | null
  token: string
  ipAddress: string | null
  company: string | null
  created_tenant_id: string | null
}
