import { RoleModel, UserRoleModel, TenantModel, TenantUserModel } from '..'

export type UserModel = {
  id: string
  created_at: Date
  updated_at: Date
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  avatar: string | null
  phone: string | null
  defaultTenantId: string | null
  verifyToken: string | null
  locale: string | null
  active: boolean
  admin: boolean
}

export type UserDto = {
  id: string
  email: string
  first_name: string
  last_name: string
  admin: boolean
  default_tenant_id: string | null
  locale: string | null
  avatar: string | null
}

export type UserWithRolesDto = UserDto & {
  roles: (UserRoleModel & { role: RoleModel })[]
}

export type UserWithDetailsDto = UserDto & {
  created_at: Date
  tenants: (TenantUserModel & { tenant: TenantModel })[]
  roles: (UserRoleModel & { role: RoleModel })[]
}
