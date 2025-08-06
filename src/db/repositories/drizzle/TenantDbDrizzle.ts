import { createId } from '@paralleldrive/cuid2'
import { and, asc, count, desc, eq, gte, inArray, or, sql, SQL } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { Tenant, TenantUser, User } from '@/db/config/drizzle/schema'
import { ITenantDb } from '@/db/interfaces/accounts/ITenantDb'
import { TenantWithDetailsDto, TenantDto } from '@/db/models'
import { PaginationRequestDto, PaginationDto } from '@/lib/dtos/PaginationDto'

export class TenantDbDrizzle implements ITenantDb {
  async getAll(): Promise<TenantWithDetailsDto[]> {
    return await drizzleDb.query.Tenant.findMany({
      with: {
        users: {
          with: {
            user: true,
          },
        },
        subscription: {
          with: {
            products: {
              with: {
                subscription_product: { with: { features: true } },
                prices: {
                  with: { subscription_price: true, subscription_usage_based_price: true },
                },
              },
            },
          },
        },
      },
      orderBy: [desc(Tenant.created_at)],
    })
  }

  async getAllIdsAndNames(): Promise<{ id: string; name: string; slug: string }[]> {
    return drizzleDb
      .select({
        id: Tenant.id,
        name: Tenant.name,
        slug: Tenant.slug,
      })
      .from(Tenant)
  }

  async getAllWithPagination({
    filters,
    pagination,
  }: {
    filters?: { name?: string; slug?: string; active?: boolean }
    pagination: PaginationRequestDto
  }): Promise<{ items: TenantWithDetailsDto[]; pagination: PaginationDto }> {
    let whereConditions: SQL[] = []

    if (filters?.name) {
      whereConditions.push(sql`LOWER(${Tenant.name}) LIKE LOWER(${`%${filters.name}%`})`)
    }
    if (filters?.slug) {
      whereConditions.push(sql`LOWER(${Tenant.slug}) LIKE LOWER(${`%${filters.slug}%`})`)
    }
    if (filters?.active !== undefined) {
      whereConditions.push(eq(Tenant.active, filters.active))
    }

    const items = await drizzleDb.query.Tenant.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        users: {
          with: {
            user: true,
          },
        },
        subscription: {
          with: {
            products: {
              with: {
                subscription_product: { with: { features: true } },
                prices: {
                  with: { subscription_price: true, subscription_usage_based_price: true },
                },
              },
            },
          },
        },
      },
      limit: pagination.page_size,
      offset: pagination.page_size * (pagination.page - 1),
      orderBy: [desc(Tenant.created_at)],
    })

    const totalItems = (
      await drizzleDb
        .select({ count: count() })
        .from(Tenant)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    )[0].count

    return {
      items,
      pagination: {
        page: pagination.page,
        page_size: pagination.page_size,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.page_size),
      },
    }
  }

  async getByUser(user_id: string): Promise<TenantDto[]> {
    return drizzleDb
      .select({
        id: Tenant.id,
        name: Tenant.name,
        slug: Tenant.slug,
        icon: Tenant.icon,
        active: Tenant.active,
      })
      .from(Tenant)
      .innerJoin(TenantUser, eq(Tenant.id, TenantUser.tenant_id))
      .where(eq(TenantUser.user_id, user_id))
      .orderBy(asc(Tenant.name))
  }

  async get(id: string): Promise<TenantWithDetailsDto | null> {
    const items = await drizzleDb.query.Tenant.findMany({
      where: eq(Tenant.id, id),
      with: {
        users: {
          with: {
            user: true,
          },
        },
        subscription: {
          with: {
            products: {
              with: {
                subscription_product: { with: { features: true } },
                prices: {
                  with: { subscription_price: true, subscription_usage_based_price: true },
                },
              },
            },
          },
        },
      },
    })
    return items.length > 0 ? items[0] : null
  }

  async getSimple(id: string): Promise<TenantDto | null> {
    const tenants = await drizzleDb
      .select({
        id: Tenant.id,
        name: Tenant.name,
        slug: Tenant.slug,
        icon: Tenant.icon,
        active: Tenant.active,
      })
      .from(Tenant)
      .where(eq(Tenant.id, id))
    return tenants.length > 0 ? tenants[0] : null
  }

  async getByIdOrSlug(id: string): Promise<TenantDto | null> {
    const tenants = await drizzleDb
      .select({
        id: Tenant.id,
        name: Tenant.name,
        slug: Tenant.slug,
        icon: Tenant.icon,
        active: Tenant.active,
      })
      .from(Tenant)
      .where(or(eq(Tenant.id, id), eq(Tenant.slug, id)))
    return tenants.length > 0 ? tenants[0] : null
  }

  async getIdByIdOrSlug(tenant: string | undefined): Promise<string | null> {
    if (!tenant) return null
    const tenants = await drizzleDb
      .select({ id: Tenant.id })
      .from(Tenant)
      .where(or(eq(Tenant.id, tenant), eq(Tenant.slug, tenant)))
    return tenants.length > 0 ? tenants[0].id : null
  }

  async countCreatedSince(since: Date | undefined): Promise<number> {
    const result = await drizzleDb
      .select({ count: count() })
      .from(Tenant)
      .where(since ? gte(Tenant.created_at, since) : undefined)
    return result[0].count
  }

  async countBySlug(slug: string): Promise<number> {
    const result = await drizzleDb
      .select({ count: count() })
      .from(Tenant)
      .where(eq(Tenant.slug, slug))
    return result[0].count
  }

  async count(): Promise<number> {
    const result = await drizzleDb.select({ count: count() }).from(Tenant)
    return result[0].count
  }

  async create({
    slug,
    name,
    icon,
    active,
  }: {
    slug: string
    name: string
    icon: string | null
    active: boolean
  }): Promise<string> {
    const id = createId()
    await drizzleDb.insert(Tenant).values({
      id,
      slug,
      name,
      icon,
      active,
      created_at: new Date(),
      updated_at: new Date(),
    })
    return id
  }

  async update(id: string, data: { name?: string; icon?: string; slug?: string }): Promise<void> {
    await drizzleDb
      .update(Tenant)
      .set({
        name: data.name,
        icon: data.icon,
        slug: data.slug,
        updated_at: new Date(),
      })
      .where(eq(Tenant.id, id))
  }

  async del(id: string): Promise<void> {
    await drizzleDb.delete(Tenant).where(eq(Tenant.id, id))
  }

  async deleteAll(): Promise<void> {
    await drizzleDb.delete(Tenant)
  }
}
