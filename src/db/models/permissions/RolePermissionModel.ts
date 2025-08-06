import { PermissionModel } from './PermissionModel'

export type RolePermissionModel = {
  id: string
  role_id: string
  permission_id: string
}

export type RolePermissionWithPermissionDto = RolePermissionModel & {
  permission: PermissionModel
}
