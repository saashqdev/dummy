import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, asc, count, desc, eq, gte, or, sql, SQL } from 'drizzle-orm'
import { tenant, tenant_user } from '@/db/schema'
import { ITenantDb } from '@/db/interfaces/accounts/ITenantDb'
import { TenantWithDetailsDto, TenantDto } from '@/db/models'
import { PaginationRequestDto, PaginationDto } from '@/lib/dtos/PaginationDto'

export class TenantDbDrizzle implements ITenantDb {
  async getAll(): Promise<TenantWithDetailsDto[]> {
    return await payload.db.tables.tenant.findMany({
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
      orderBy: [desc(tenant.created_at)],
    })
  }

  async getAllIdsAndNames(): Promise<{ id: string; name: string; slug: string }[]> {
    return payload.db.tables
      .select({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      })
      .from(tenant)
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
      whereConditions.push(sql`LOWER(${tenant.name}) LIKE LOWER(${`%${filters.name}%`})`)
    }
    if (filters?.slug) {
      whereConditions.push(sql`LOWER(${tenant.slug}) LIKE LOWER(${`%${filters.slug}%`})`)
    }
    if (filters?.active !== undefined) {
      whereConditions.push(eq(tenant.active, filters.active))
    }

    const items = await payload.db.tables.tenant.findMany({
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
      limit: pagination.pageSize,
      offset: pagination.pageSize * (pagination.page - 1),
      orderBy: [desc(tenant.created_at)],
    })

    const totalItems = (
      await payload.db.tables
        .select({ count: count() })
        .from(tenant)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    )[0].count

    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    }
  }

  async getByUser(user_id: string): Promise<TenantDto[]> {
    return payload.db.tables
      .select({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        icon: tenant.icon,
        active: tenant.active,
      })
      .from(tenant)
      .innerJoin(tenant_user, eq(tenant.id, tenant_user.tenant_id))
      .where(eq(tenant_user.user_id, user_id))
      .orderBy(asc(tenant.name))
  }

  async get(id: string): Promise<TenantWithDetailsDto | null> {
    const items = await payload.db.tables.tenant.findMany({
      where: eq(tenant.id, id),
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
    const tenants = await payload.db.tables
      .select({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        icon: tenant.icon,
        active: tenant.active,
      })
      .from(tenant)
      .where(eq(tenant.id, id))
    return tenants.length > 0 ? tenants[0] : null
  }

  async getByIdOrSlug(id: string): Promise<TenantDto | null> {
    const tenants = await payload.db.tables
      .select({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        icon: tenant.icon,
        active: tenant.active,
      })
      .from(tenant)
      .where(or(eq(tenant.id, id), eq(tenant.slug, id)))
    return tenants.length > 0 ? tenants[0] : null
  }

  async getIdByIdOrSlug(tenantIdOrSlug: string | undefined): Promise<string | null> {
    if (!tenantIdOrSlug) return null
    const tenants = await payload.db.tables
      .select({ id: tenant.id })
      .from(tenant)
      .where(or(eq(tenant.id, tenantIdOrSlug), eq(tenant.slug, tenantIdOrSlug)))
    return tenants.length > 0 ? tenants[0].id : null
  }

  async countCreatedSince(since: Date | undefined): Promise<number> {
    const result = await payload.db.tables
      .select({ count: count() })
      .from(tenant)
      .where(since ? gte(tenant.created_at, since) : undefined)
    return result[0].count
  }

  async countBySlug(slug: string): Promise<number> {
    const result = await payload.db.tables
      .select({ count: count() })
      .from(tenant)
      .where(eq(tenant.slug, slug))
    return result[0].count
  }

  async count(): Promise<number> {
    const result = await payload.db.tables.select({ count: count() }).from(tenant)
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
    await payload.db.tables.insert(tenant).values({
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
    await payload.db.tables
      .update(tenant)
      .set({
        name: data.name,
        icon: data.icon,
        slug: data.slug,
        updated_at: new Date(),
      })
      .where(eq(tenant.id, id))
  }

  async del(id: string): Promise<void> {
    await payload.db.tables.delete(tenant).where(eq(tenant.id, id))
  }

  async deleteAll(): Promise<void> {
    await payload.db.tables.delete(tenant)
  }
}
