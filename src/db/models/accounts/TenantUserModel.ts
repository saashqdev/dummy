import { UserWithRolesDto } from '..'

export type TenantUserModel = {
  id: string
  created_at: Date
  tenant_id: string
  user_id: string
}

export type TenantUserWithUserDto = TenantUserModel & {
  user: UserWithRolesDto
}
