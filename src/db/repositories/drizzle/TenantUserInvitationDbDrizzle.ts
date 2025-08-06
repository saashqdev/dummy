import { createId } from '@paralleldrive/cuid2'
import { and, eq, sql, SQL } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { TenantUserInvitation, Tenant } from '@/db/config/drizzle/schema'
import { ITenantUserInvitationDb } from '@/db/interfaces/accounts/ITenantUserInvitationDb'
import { TenantUserInvitationWithTenantDto, TenantUserInvitationModel } from '@/db/models'

export class TenantUserInvitationDbDrizzle implements ITenantUserInvitationDb {
  async get(id: string): Promise<TenantUserInvitationWithTenantDto | null> {
    const items = await drizzleDb.query.TenantUserInvitation.findMany({
      where: eq(TenantUserInvitation.id, id),
      with: {
        tenant: true,
      },
    })
    return items.length === 0 ? null : items[0]
  }

  async getPending(tenant_id: string): Promise<TenantUserInvitationModel[]> {
    return drizzleDb.query.TenantUserInvitation.findMany({
      where: and(
        eq(TenantUserInvitation.tenant_id, tenant_id),
        eq(TenantUserInvitation.pending, true),
      ),
    })
  }

  async create(
    data: Omit<TenantUserInvitationModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await drizzleDb.insert(TenantUserInvitation).values({
      id,
      tenant_id: data.tenant_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      pending: data.pending,
      created_user_id: data.created_user_id,
      from_user_id: data.from_user_id,
    })
    return id
  }

  async update(id: string, data: { pending?: boolean }): Promise<void> {
    await drizzleDb
      .update(TenantUserInvitation)
      .set({
        pending: data.pending,
      })
      .where(eq(TenantUserInvitation.id, id))
      .execute()
  }

  async del(id: string): Promise<void> {
    await drizzleDb.delete(TenantUserInvitation).where(eq(TenantUserInvitation.id, id)).execute()
  }
}
