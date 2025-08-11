import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, asc, count, desc, eq, gte, or, sql, SQL } from 'drizzle-orm'
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
      orderBy: [desc(payload.db.tables.tenants.created_at)],
    })
  }

  async getAllIdsAndNames(): Promise<{ id: string; name: string; slug: string }[]> {
    return payload.db.tables
      .select({
        id: payload.db.tables.tenants.tenant_id,
        name: payload.db.tables.tenants.name,
        slug: payload.db.tables.tenants.slug,
      })
      .from(payload.db.tables.tenants)
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
      whereConditions.push(
        sql`LOWER(${payload.db.tables.tenants.name}) LIKE LOWER(${`%${filters.name}%`})`,
      )
    }
    if (filters?.slug) {
      whereConditions.push(
        sql`LOWER(${payload.db.tables.tenants.slug}) LIKE LOWER(${`%${filters.slug}%`})`,
      )
    }
    if (filters?.active !== undefined) {
      whereConditions.push(eq(payload.db.tables.tenants.active, filters.active))
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
      orderBy: [desc(payload.db.tables.tenant.created_at)],
    })

    const totalItems = (
      await payload.db.tables
        .select({ count: count() })
        .from(payload.db.tables.tenants)
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

  async getByUser(userId: string): Promise<TenantDto[]> {
    return payload.db.tables
      .select({
        id: payload.db.tables.tenants.tenant_id,
        name: payload.db.tables.tenants.name,
        slug: payload.db.tables.tenants.slug,
        icon: payload.db.tables.tenants.icon,
        active: payload.db.tables.tenants.active,
      })
      .from(payload.db.tables.tenants)
      .innerJoin(
        payload.db.tables.tenant_user,
        eq(payload.db.tables.tenants.tenant_id, payload.db.tables.tenant_user.tenant_id),
      )
      .where(eq(payload.db.tables.tenant_user.user_id, userId))
      .orderBy(asc(payload.db.tables.tenants.name))
  }

  async get(id: string): Promise<TenantWithDetailsDto | null> {
    const items = await payload.db.tables.tenant.findMany({
      where: eq(payload.db.tables.tenants.id, id),
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
        id: payload.db.tables.tenants.id,
        name: payload.db.tables.tenants.name,
        slug: payload.db.tables.tenants.slug,
        icon: payload.db.tables.tenants.icon,
        active: payload.db.tables.tenants.active,
      })
      .from(payload.db.tables.tenants)
      .where(eq(payload.db.tables.tenants.id, id))
    return tenants.length > 0 ? tenants[0] : null
  }

  async getByIdOrSlug(id: string): Promise<TenantDto | null> {
    const tenants = await payload.db.tables
      .select({
        id: payload.db.tables.tenants.id,
        name: payload.db.tables.tenants.name,
        slug: payload.db.tables.tenants.slug,
        icon: payload.db.tables.tenants.icon,
        active: payload.db.tables.tenants.active,
      })
      .from(payload.db.tables.tenants)
      .where(or(eq(payload.db.tables.tenants.id, id), eq(payload.db.tables.tenants.slug, id)))
    return tenants.length > 0 ? tenants[0] : null
  }

  async getIdByIdOrSlug(tenantIdOrSlug: string | undefined): Promise<string | null> {
    if (!tenantIdOrSlug) return null
    const tenants = await payload.db.tables
      .select({ id: payload.db.tables.tenants.id })
      .from(payload.db.tables.tenants)
      .where(
        or(
          eq(payload.db.tables.tenants.id, tenantIdOrSlug),
          eq(payload.db.tables.tenants.slug, tenantIdOrSlug),
        ),
      )
    return tenants.length > 0 ? tenants[0].id : null
  }

  async countCreatedSince(since: Date | undefined): Promise<number> {
    const result = await payload.db.tables
      .select({ count: count() })
      .from(payload.db.tables.tenants)
      .where(since ? gte(payload.db.tables.tenants.created_at, since) : undefined)
    return result[0].count
  }

  async countBySlug(slug: string): Promise<number> {
    const result = await payload.db.tables
      .select({ count: count() })
      .from(payload.db.tables.tenants)
      .where(eq(payload.db.tables.tenants.slug, slug))
    return result[0].count
  }

  async count(): Promise<number> {
    const result = await payload.db.tables
      .select({ count: count() })
      .from(payload.db.tables.tenants)
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
    await payload.db.tables.insert(payload.db.tables.tenants).values({
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
      .update(payload.db.tables.tenants)
      .set({
        name: data.name,
        icon: data.icon,
        slug: data.slug,
        updated_at: new Date(),
      })
      .where(eq(payload.db.tables.tenants.id, id))
  }

  async del(id: string): Promise<void> {
    await payload.db.tables
      .delete(payload.db.tables.tenants)
      .where(eq(payload.db.tables.tenants.id, id))
  }

  async deleteAll(): Promise<void> {
    await payload.db.tables.delete(payload.db.tables.tenants)
  }
}
