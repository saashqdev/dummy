import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, eq } from 'drizzle-orm'
import { tenant_user_invitation } from '@/db/schema'
import { ITenantUserInvitationDb } from '@/db/interfaces/accounts/ITenantUserInvitationDb'
import { TenantUserInvitationWithTenantDto, TenantUserInvitationModel } from '@/db/models'

export class TenantUserInvitationDbDrizzle implements ITenantUserInvitationDb {
  async get(id: string): Promise<TenantUserInvitationWithTenantDto | null> {
    const items = await payload.db.tables.tenant_user_invitation.findMany({
      where: eq(tenant_user_invitation.id, id),
      with: {
        tenant: true,
      },
    })
    return items.length === 0 ? null : items[0]
  }

  async getPending(tenant_id: string): Promise<TenantUserInvitationModel[]> {
    return payload.db.tables.tenant_user_invitation.findMany({
      where: and(
        eq(tenant_user_invitation.tenant_id, tenant_id),
        eq(tenant_user_invitation.pending, true),
      ),
    })
  }

  async create(
    data: Omit<TenantUserInvitationModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    await payload.db.tables.tenant_user_invitation.insert().values({
      id,
      tenant_id: data.tenant_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      pending: data.pending,
      created_userId: data.created_user_id,
      from_userId: data.from_user_id,
    })
    return id
  }

  async update(id: string, data: { pending?: boolean }): Promise<void> {
    await payload.db.tables
      .update(tenant_user_invitation)
      .set({
        pending: data.pending,
      })
      .where(eq(tenant_user_invitation.id, id))
      .execute()
  }

  async del(id: string): Promise<void> {
    await payload.db.tables.tenant_user_invitation
      .delete()
      .where(eq(tenant_user_invitation.id, id))
      .execute()
  }
}
