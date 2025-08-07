import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, count, eq, inArray, sql, SQL } from 'drizzle-orm'
import { tenant_user, user } from '@/db/schema'
import { IUserDb } from '@/db/interfaces/accounts/IUserDb'
import { UserModel, UserDto, UserWithDetailsDto } from '@/db/models'
import { PaginationDto, SortedByDto } from '@/lib/dtos/PaginationDto'

export class UserDbDrizzle implements IUserDb {
  async getAllWhereTenant(tenant_id: string): Promise<UserWithDetailsDto[]> {
    const items = await payload.db.tables.user.findMany({
      where: and(
        inArray(
          user.id,
          payload.db.tables.tenant_user
            .select({ user_id: tenant_user.user_id })
            .where(eq(tenant_user.tenant_id, tenant_id)),
        ),
      ),
      with: {
        tenants: {
          with: {
            tenant: true,
          },
          // where: (TenantUser, { eq }) => eq(TenantUser.tenant_id, tenant_id),
        },
        roles: {
          with: {
            role: true,
          },
        },
      },
    })
    return items
  }
  async getAllWithPagination({
    filters,
    pagination,
  }: {
    filters?:
      | {
          email?: string
          first_name?: string
          last_name?: string
          tenant_id?: string | null
          admin?: boolean | undefined
        }
      | undefined
    pagination?:
      | { page: number; pageSize: number; sortedBy?: SortedByDto[] | undefined }
      | undefined
  }): Promise<{ items: UserWithDetailsDto[]; pagination: PaginationDto }> {
    let whereConditions: SQL[] = []

    if (filters?.email) {
      whereConditions.push(sql`LOWER(${user.email}) LIKE LOWER(${`%${filters.email}%`})`)
    }
    if (filters?.first_name) {
      whereConditions.push(sql`LOWER(${user.first_name}) LIKE LOWER(${`%${filters.first_name}%`})`)
    }
    if (filters?.last_name) {
      whereConditions.push(sql`LOWER(${user.last_name}) LIKE LOWER(${`%${filters.last_name}%`})`)
    }
    if (filters?.tenant_id) {
      const tenantUserSubquery = payload.db.tables.tenant_user
        .select({ user_id: tenant_user.user_id })
        .where(eq(tenant_user.tenant_id, filters.tenant_id))
      whereConditions.push(inArray(user.id, tenantUserSubquery))
    }
    if (filters?.admin !== undefined) {
      whereConditions.push(eq(user.admin, filters.admin))
    }

    // let orderBy: SQL[] = [asc(User.created_at)];
    // if (pagination?.sortedBy?.length) {
    //   pagination.sortedBy = pagination.sortedBy.filter((s) => ["email", "first_name", "last_name", "created_at"].includes(s.name));
    //   orderBy = pagination.sortedBy.map((s) => (s.direction === "desc" ? desc(s.name) : asc(s.name)));
    // }

    const users = await payload.db.tables.user.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        tenants: {
          with: {
            tenant: true,
          },
        },
        roles: {
          with: {
            role: true,
          },
        },
      },
      limit: pagination?.pageSize,
      offset: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      // orderBy,
    })

    const totalItems = (
      await payload.db.tables
        .select({ count: count() })
        .from(user)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    )[0].count

    return {
      items: users,
      pagination: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? 10,
        totalItems,
        totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? 10)),
      },
    }
  }
  getAll(): Promise<UserWithDetailsDto[]> {
    return payload.db.tables.user.findMany({
      with: {
        tenants: {
          with: {
            tenant: true,
          },
        },
        roles: {
          with: {
            role: true,
          },
        },
      },
    })
  }
  async get(user_id: string): Promise<UserDto | null> {
    const items = await payload.db.tables
      .select({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
        admin: user.admin,
        default_tenant_id: user.default_tenant_id,
        locale: user.locale,
      })
      .from(user)
      .where(eq(user.id, user_id))
      .execute()
    if (items.length === 0) {
      return null
    }
    return items[0]
  }
  async getByEmail(email: string): Promise<UserDto | null> {
    const items = await payload.db.tables
      .select({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
        admin: user.admin,
        default_tenant_id: user.default_tenant_id,
        locale: user.locale,
      })
      .from(user)
      .where(eq(user.email, email))
      .execute()
    if (items.length === 0) {
      return null
    }
    return items[0]
  }
  async getByEmailWithDetails(email: string): Promise<UserWithDetailsDto | null> {
    const items = await payload.db.tables.user.findMany({
      where: eq(user.email, email),
      with: {
        tenants: {
          with: {
            tenant: true,
          },
        },
        roles: {
          with: {
            role: true,
          },
        },
      },
    })
    return items.length === 0 ? null : items[0]
  }
  async getPasswordHash(id: string): Promise<string | null> {
    const items = await payload.db.tables.user
      .select({ hash: user.hash })
      .from(user)
      .where(eq(user.id, id))
      .execute()
    return items.length === 0 ? null : items[0].hash
  }
  async getVerifyToken(id: string): Promise<string | null> {
    const items = await payload.db.tables.user
      .select({ verify_token: user.verify_token })
      .from(user)
      .where(eq(user.id, id))
      .execute()
    return items.length === 0 ? null : items[0].verify_token
  }
  async count(): Promise<number> {
    return payload.db.tables
      .select({ count: count() })
      .from(user)
      .execute()
      .then((items: { count: any }[]) => items[0].count)
  }
  async create(data: Omit<UserModel, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = createId()
    await payload.db.tables.user.insert({
      id,
      created_at: new Date(),
      updated_at: new Date(),
      email: data.email,
      hash: data.hash,
      first_name: data.first_name,
      last_name: data.last_name,
      active: data.active,
      admin: data.admin,
      avatar: data.avatar,
      locale: data.locale,
      phone: data.phone,
      default_tenant_id: data.default_tenant_id,
    })
    return id
  }
  async update(
    id: string,
    data: {
      first_name?: string
      last_name?: string
      avatar?: string | null
      locale?: string | null
      verify_token?: string | null
      hash?: string
      default_tenant_id?: string | null
      admin?: boolean
    },
  ): Promise<void> {
    await payload.db.tables
      .update(user)
      .set({
        first_name: data.first_name,
        last_name: data.last_name,
        avatar: data.avatar,
        locale: data.locale,
        verify_token: data.verify_token,
        hash: data.hash,
        default_tenant_id: data.default_tenant_id,
        admin: data.admin,
      })
      .where(eq(user.id, id))
      .execute()
  }
  async del(id: string): Promise<void> {
    await payload.db.tables.user.delete().where(eq(user.id, id)).execute()
  }
  async deleteAll(): Promise<void> {
    await payload.db.tables.user.delete().execute()
  }
}
