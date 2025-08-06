import { TenantUserInvitationModel, TenantUserInvitationWithTenantDto } from '../../models'

export interface ITenantUserInvitationDb {
  get(id: string): Promise<TenantUserInvitationWithTenantDto | null>
  getPending(tenant_id: string): Promise<TenantUserInvitationModel[]>
  create(data: Omit<TenantUserInvitationModel, 'id' | 'created_at' | 'updated_at'>): Promise<string>
  update(id: string, data: { pending?: boolean }): Promise<void>
  del(id: string): Promise<void>
}
