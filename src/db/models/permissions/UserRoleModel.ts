import { RoleModel } from './RoleModel'

export type UserRoleModel = {
  id: string
  created_at: Date
  userId: string
  role_id: string
  tenant_id: string | null
}

export type UserRoleWithDetailsDto = UserRoleModel & {
  role: RoleModel & {
    permissions: {
      permission: { name: string }
    }[]
  }
}
