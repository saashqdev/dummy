import { TenantSubscriptionWithDetailsDto, TenantUserModel, UserDto } from '..'

export type TenantModel = {
  id: string
  created_at: Date
  updated_at: Date
  slug: string
  name: string
  icon: string | null
  subscription_id: string | null
  active: boolean
}

export type TenantDto = {
  id: string
  name: string
  slug: string
  icon: string | null
  active: boolean
}

export type TenantWithDetailsDto = TenantModel & {
  users: (TenantUserModel & {
    user: UserDto
  })[]
  subscription: TenantSubscriptionWithDetailsDto | null
}
