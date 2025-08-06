import { createId } from '@paralleldrive/cuid2'
import { and, count, eq, inArray, sql, SQL } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { TenantUser, User } from '@/db/config/drizzle/schema'
import { IUserDb } from '@/db/interfaces/accounts/IUserDb'
import { UserModel, UserDto, UserWithDetailsDto } from '@/db/models'
import { PaginationDto, SortedByDto } from '@/lib/dtos/PaginationDto'

export class UserDbDrizzle implements IUserDb {
  async getAllWhereTenant(tenant_id: string): Promise<UserWithDetailsDto[]> {
    const items = await drizzleDb.query.User.findMany({
      where: and(
        inArray(
          User.id,
          drizzleDb
            .select({ user_id: TenantUser.user_id })
            .from(TenantUser)
            .where(eq(TenantUser.tenant_id, tenant_id)),
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
      | { page: number; page_size: number; sortedBy?: SortedByDto[] | undefined }
      | undefined
  }): Promise<{ items: UserWithDetailsDto[]; pagination: PaginationDto }> {
    let whereConditions: SQL[] = []

    if (filters?.email) {
      whereConditions.push(sql`LOWER(${User.email}) LIKE LOWER(${`%${filters.email}%`})`)
    }
    if (filters?.first_name) {
      whereConditions.push(sql`LOWER(${User.first_name}) LIKE LOWER(${`%${filters.first_name}%`})`)
    }
    if (filters?.last_name) {
      whereConditions.push(sql`LOWER(${User.last_name}) LIKE LOWER(${`%${filters.last_name}%`})`)
    }
    if (filters?.tenant_id) {
      const tenantUserSubquery = drizzleDb
        .select({ user_id: TenantUser.user_id })
        .from(TenantUser)
        .where(eq(TenantUser.tenant_id, filters.tenant_id))
      whereConditions.push(inArray(User.id, tenantUserSubquery))
    }
    if (filters?.admin !== undefined) {
      whereConditions.push(eq(User.admin, filters.admin))
    }

    // let orderBy: SQL[] = [asc(User.created_at)];
    // if (pagination?.sortedBy?.length) {
    //   pagination.sortedBy = pagination.sortedBy.filter((s) => ["email", "first_name", "last_name", "created_at"].includes(s.name));
    //   orderBy = pagination.sortedBy.map((s) => (s.direction === "desc" ? desc(s.name) : asc(s.name)));
    // }

    const users = await drizzleDb.query.User.findMany({
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
      limit: pagination?.page_size,
      offset: pagination ? pagination.page_size * (pagination.page - 1) : undefined,
      // orderBy,
    })

    const totalItems = (
      await drizzleDb
        .select({ count: count() })
        .from(User)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    )[0].count

    return {
      items: users,
      pagination: {
        page: pagination?.page ?? 1,
        page_size: pagination?.page_size ?? 10,
        totalItems,
        totalPages: Math.ceil(totalItems / (pagination?.page_size ?? 10)),
      },
    }
  }
  getAll(): Promise<UserWithDetailsDto[]> {
    return drizzleDb.query.User.findMany({
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
    const items = await drizzleDb
      .select({
        id: User.id,
        email: User.email,
        first_name: User.first_name,
        last_name: User.last_name,
        avatar: User.avatar,
        admin: User.admin,
        default_tenant_id: User.default_tenant_id,
        locale: User.locale,
      })
      .from(User)
      .where(eq(User.id, user_id))
      .execute()
    if (items.length === 0) {
      return null
    }
    return items[0]
  }
  async getByEmail(email: string): Promise<UserDto | null> {
    const items = await drizzleDb
      .select({
        id: User.id,
        email: User.email,
        first_name: User.first_name,
        last_name: User.last_name,
        avatar: User.avatar,
        admin: User.admin,
        default_tenant_id: User.default_tenant_id,
        locale: User.locale,
      })
      .from(User)
      .where(eq(User.email, email))
      .execute()
    if (items.length === 0) {
      return null
    }
    return items[0]
  }
  async getByEmailWithDetails(email: string): Promise<UserWithDetailsDto | null> {
    const items = await drizzleDb.query.User.findMany({
      where: eq(User.email, email),
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
    const items = await drizzleDb
      .select({ hash: User.hash })
      .from(User)
      .where(eq(User.id, id))
      .execute()
    return items.length === 0 ? null : items[0].hash
  }
  async getVerifyToken(id: string): Promise<string | null> {
    const items = await drizzleDb
      .select({ verify_token: User.verify_token })
      .from(User)
      .where(eq(User.id, id))
      .execute()
    return items.length === 0 ? null : items[0].verify_token
  }
  async count(): Promise<number> {
    return drizzleDb
      .select({ count: count() })
      .from(User)
      .execute()
      .then((items) => items[0].count)
  }
  async create(data: Omit<UserModel, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = createId()
    await drizzleDb.insert(User).values({
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
    await drizzleDb
      .update(User)
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
      .where(eq(User.id, id))
      .execute()
  }
  async del(id: string): Promise<void> {
    await drizzleDb.delete(User).where(eq(User.id, id)).execute()
  }
  async deleteAll(): Promise<void> {
    await drizzleDb.delete(User).execute()
  }
}
