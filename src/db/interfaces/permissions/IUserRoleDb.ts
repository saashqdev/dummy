import { UserRoleModel, UserRoleWithDetailsDto } from '../../models'

export interface IUserRoleDb {
  get(params: {
    userId: string
    role_id: string
    tenant_id: string | null
  }): Promise<UserRoleModel | null>
  getInTenant(userId: string, tenant_id: string, role_name: string): Promise<UserRoleModel | null>
  getInAdmin(userId: string, role_name: string): Promise<UserRoleModel | null>
  getPermissionsByUser(userId: string, tenant_id: string | null): Promise<UserRoleWithDetailsDto[]>
  countPermissionByUser(
    userId: string,
    tenant_id: string | null,
    permission_name: string,
  ): Promise<number>
  create(data: { userId: string; role_id: string; tenant_id: string | null }): Promise<string>
  createMany(userId: string, roles: { id: string; tenant_id: string | null }[]): Promise<void>
  del(userId: string, role_id: string): Promise<void>
  deleteAllByUser(userId: string, type: string): Promise<void>
}
