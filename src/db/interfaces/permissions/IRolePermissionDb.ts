import { RolePermissionWithPermissionDto } from '../../models'

export interface IRolePermissionDb {
  get(role_id: string, permission_id: string): Promise<RolePermissionWithPermissionDto | null>
  getAll(): Promise<RolePermissionWithPermissionDto[]>
  create(data: { role_id: string; permission_id: string }): Promise<string>
  deleteByRoleId(role_id: string): Promise<void>
  deleteByPermissionId(permission_id: string): Promise<void>
}
