import { UserRoleModel, UserRoleWithDetailsDto } from '../../models'

export interface IUserRoleDb {
  get(params: {
    user_id: string
    role_id: string
    tenant_id: string | null
  }): Promise<UserRoleModel | null>
  getInTenant(user_id: string, tenant_id: string, role_name: string): Promise<UserRoleModel | null>
  getInAdmin(user_id: string, role_name: string): Promise<UserRoleModel | null>
  getPermissionsByUser(user_id: string, tenant_id: string | null): Promise<UserRoleWithDetailsDto[]>
  countPermissionByUser(
    user_id: string,
    tenant_id: string | null,
    permission_name: string,
  ): Promise<number>
  create(data: { user_id: string; role_id: string; tenant_id: string | null }): Promise<string>
  createMany(user_id: string, roles: { id: string; tenant_id: string | null }[]): Promise<void>
  del(user_id: string, role_id: string): Promise<void>
  deleteAllByUser(user_id: string, type: string): Promise<void>
}
