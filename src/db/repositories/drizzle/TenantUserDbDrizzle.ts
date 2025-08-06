import { createId } from '@paralleldrive/cuid2'
import { and, eq, gte, lt, count } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { TenantUser } from '@/db/config/drizzle/schema'
import { ITenantUserDb } from '@/db/interfaces/accounts/ITenantUserDb'
import { TenantUserModel, TenantUserWithUserDto } from '@/db/models'

export class TenantUserDbDrizzle implements ITenantUserDb {
  async getAll(tenant_id: string): Promise<TenantUserWithUserDto[]> {
    const items = await drizzleDb.query.TenantUser.findMany({
      where: eq(TenantUser.tenant_id, tenant_id),
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
    user_id,
  }: {
    tenant_id: string
    user_id: string
  }): Promise<TenantUserModel | null> {
    const items = await drizzleDb.query.TenantUser.findMany({
      where: and(eq(TenantUser.tenant_id, tenant_id), eq(TenantUser.user_id, user_id)),
    })
    return items.length === 0 ? null : items[0]
  }

  async getById(id: string): Promise<TenantUserWithUserDto | null> {
    const items = await drizzleDb.query.TenantUser.findMany({
      where: eq(TenantUser.id, id),
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
    const results = await drizzleDb
      .select({ count: count() })
      .from(TenantUser)
      .where(eq(TenantUser.tenant_id, tenant_id))
    return results[0].count
  }
  async countByCreatedAt(tenant_id: string, created_at: { gte: Date; lt: Date }): Promise<number> {
    const result = await drizzleDb
      .select({ count: count() })
      .from(TenantUser)
      .where(
        and(
          eq(TenantUser.tenant_id, tenant_id),
          gte(TenantUser.created_at, created_at.gte),
          lt(TenantUser.created_at, created_at.lt),
        ),
      )
    return result[0].count
  }
  async create(data: { tenant_id: string; user_id: string }): Promise<string> {
    const id = createId()
    await drizzleDb.insert(TenantUser).values({
      id,
      tenant_id: data.tenant_id,
      user_id: data.user_id,
      created_at: new Date(),
    })
    return id
  }

  async del(id: string): Promise<void> {
    await drizzleDb.delete(TenantUser).where(eq(TenantUser.id, id)).execute()
  }
}
