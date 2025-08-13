import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, eq, gte, lt, count } from 'drizzle-orm'
import { tenant_user } from '@/db/schema'
import { ITenantUserDb } from '@/db/interfaces/accounts/ITenantUserDb'
import { TenantUserModel, TenantUserWithUserDto } from '@/db/models'

export class TenantUserDbDrizzle implements ITenantUserDb {
  async getAll(tenant_id: string): Promise<TenantUserWithUserDto[]> {
    const items = await payload.db.tables.tenant_user.findMany({
      where: eq(tenant_user.tenant_id, tenant_id),
      with: {
        user: {
          with: {
            roles: {
              with: {
                role: true,
              },
            },
          },
        },
      },
    })
    return items
  }

  async get({
    tenant_id,
    userId,
  }: {
    tenant_id: string
    userId: string
  }): Promise<TenantUserModel | null> {
    const items = await payload.db.tables.tenant_user.findMany({
      where: and(eq(tenant_user.tenant_id, tenant_id), eq(tenant_user.userId, userId)),
    })
    return items.length === 0 ? null : items[0]
  }

  async getById(id: string): Promise<TenantUserWithUserDto | null> {
    const items = await payload.db.tables.tenant_user.findMany({
      where: eq(tenant_user.id, id),
      with: {
        user: {
          with: {
            roles: {
              with: {
                role: true,
              },
            },
          },
        },
      },
    })
    return items.length === 0 ? null : items[0]
  }
  async count(tenant_id: string): Promise<number> {
    const results = await payload.db.tables
      .select({ count: count() })
      .from(tenant_user)
      .where(eq(tenant_user.tenant_id, tenant_id))
    return results[0].count
  }
  async countByCreatedAt(tenant_id: string, created_at: { gte: Date; lt: Date }): Promise<number> {
    const result = await payload.db.tables
      .select({ count: count() })
      .from(tenant_user)
      .where(
        and(
          eq(tenant_user.tenant_id, tenant_id),
          gte(tenant_user.created_at, created_at.gte.toISOString()),
          lt(tenant_user.created_at, created_at.lt.toISOString()),
        ),
      )
    return result[0].count
  }
  async create(data: { tenant_id: string; userId: string }): Promise<string> {
    const id = createId()
    await payload.db.tables.insert(tenant_user).values({
      id,
      tenant_id: data.tenant_id,
      user_id: data.userId,
      created_at: new Date(),
    })
    return id
  }

  async del(id: string): Promise<void> {
    await payload.db.tables.tenant_user.delete().where(eq(tenant_user.id, id)).execute()
  }
}
