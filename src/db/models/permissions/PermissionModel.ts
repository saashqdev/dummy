import { RoleModel, RolePermissionModel } from '..'

export type PermissionModel = {
  id: string
  created_at: Date
  updated_at: Date
  name: string
  description: string
  type: string
  is_default: boolean
  order: number
}

export type PermissionDto = {
  id: string
  name: string
  description: string
}

export type PermissionWithRolesDto = PermissionModel & {
  in_roles: (RolePermissionModel & { role: RoleModel })[]
}
