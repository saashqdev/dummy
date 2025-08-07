export type CreditModel = {
  id: string
  created_at: Date
  tenant_id: string
  userId: string | null
  amount: number
  type: string
  object_id: string | null
}

export type CreditWithDetailsDto = CreditModel & {
  tenant: { name: string }
  user: { email: string } | null
}
