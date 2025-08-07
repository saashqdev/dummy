import { TenantUserModel, TenantUserWithUserDto } from '../../models'

export interface ITenantUserDb {
  getAll(tenant_id: string): Promise<TenantUserWithUserDto[]>
  get(filters: { tenant_id: string; userId: string }): Promise<TenantUserModel | null>
  getById(id: string): Promise<TenantUserWithUserDto | null>
  count(tenant_id: string): Promise<number>
  countByCreatedAt(tenant_id: string, created_at: { gte: Date; lt: Date }): Promise<number>
  create(data: { tenant_id: string; userId: string }): Promise<string>
  del(id: string): Promise<void>
}
