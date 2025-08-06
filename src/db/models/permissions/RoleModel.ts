import { PermissionModel, RolePermissionModel, UserDto, UserRoleModel } from '..'

export type RoleModel = {
  id: string
  created_at: Date
  updated_at: Date
  name: string
  description: string
  type: string
  assign_to_new_users: boolean
  is_default: boolean
  order: number
}

export type RoleWithPermissionsDto = RoleModel & {
  permissions: (RolePermissionModel & { permission: PermissionModel })[]
}

export type RoleWithPermissionsAndUsersDto = RoleWithPermissionsDto & {
  users: (UserRoleModel & { user: UserDto })[]
}
