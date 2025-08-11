import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, count, eq, inArray, sql, SQL } from 'drizzle-orm'
import { IUserDb } from '@/db/interfaces/accounts/IUserDb'
import { UserModel, UserDto, UserWithDetailsDto } from '@/db/models'
import { PaginationDto, SortedByDto } from '@/lib/dtos/PaginationDto'

export class UserDbDrizzle implements IUserDb {
  async getAllWhereTenant(tenant_id: string): Promise<UserWithDetailsDto[]> {
    const items = await payload.db.tables.users.findMany({
      where: and(
        inArray(
          payload.db.tables.users.user_id,
          payload.db.tables.tenants
            .select({ userId: payload.db.tables.users.user_id })
            .where(eq(payload.db.tables.tenants.id, tenant_id)),
        ),
      ),
      with: {
        tenants: {
          with: {
            tenant: true,
          },
          // where: (tenant_user, { eq }) => eq(tenant_user.tenant_id, tenant_id),
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
          firstName?: string
          lastName?: string
          tenantId?: string | null
          admin?: boolean | undefined
        }
      | undefined
    pagination?:
      | { page: number; pageSize: number; sortedBy?: SortedByDto[] | undefined }
      | undefined
  }): Promise<{ items: UserWithDetailsDto[]; pagination: PaginationDto }> {
    let whereConditions: SQL[] = []

    if (filters?.email) {
      whereConditions.push(
        sql`LOWER(${payload.db.tables.users.email}) LIKE LOWER(${`%${filters.email}%`})`,
      )
    }
    if (filters?.firstName) {
      whereConditions.push(
        sql`LOWER(${payload.db.tables.users.first_name}) LIKE LOWER(${`%${filters.firstName}%`})`,
      )
    }
    if (filters?.lastName) {
      whereConditions.push(
        sql`LOWER(${payload.db.tables.users.last_name}) LIKE LOWER(${`%${filters.lastName}%`})`,
      )
    }
    if (filters?.tenantId) {
      const tenantUserSubquery = payload.db.tables.tenant_user
        .select({ userId: payload.db.tables.users.user_id })
        .where(eq(payload.db.tables.tenant_user.tenant_id, filters.tenantId))
      whereConditions.push(inArray(payload.db.tables.users.user_id, tenantUserSubquery))
    }
    if (filters?.admin !== undefined) {
      whereConditions.push(eq(payload.db.tables.users.admin, filters.admin))
    }

    // let orderBy: SQL[] = [asc(User.created_at)];
    // if (pagination?.sortedBy?.length) {
    //   pagination.sortedBy = pagination.sortedBy.filter((s) => ["email", "first_name", "last_name", "created_at"].includes(s.name));
    //   orderBy = pagination.sortedBy.map((s) => (s.direction === "desc" ? desc(s.name) : asc(s.name)));
    // }

    const users = await payload.db.tables.users.findMany({
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
        .from(payload.db.tables.users)
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
    return payload.db.tables.users.findMany({
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
  async get(userId: string): Promise<UserDto | null> {
    const items = await payload.db.tables
      .select({
        id: payload.db.tables.users.id,
        email: payload.db.tables.users.email,
        firstName: payload.db.tables.users.firstName,
        lastName: payload.db.tables.users.lastName,
        avatar: payload.db.tables.users.avatar,
        admin: payload.db.tables.users.admin,
        defaultTenantId: payload.db.tables.users.defaultTenantId,
        locale: payload.db.tables.users.locale,
      })
      .from(payload.db.tables.users)
      .where(eq(payload.db.tables.users.user_id, userId))
      .execute()
    if (items.length === 0) {
      return null
    }
    return items[0]
  }
  async getByEmail(email: string): Promise<UserDto | null> {
    const items = await payload.db.tables
      .select({
        id: payload.db.tables.users.id,
        email: payload.db.tables.users.email,
        firstName: payload.db.tables.users.firstName,
        lastName: payload.db.tables.users.lastName,
        avatar: payload.db.tables.users.avatar,
        admin: payload.db.tables.users.admin,
        defaultTenantId: payload.db.tables.users.defaultTenantId,
        locale: payload.db.tables.users.locale,
      })
      .from(payload.db.tables.users)
      .where(eq(payload.db.tables.users.email, email))
      .execute()
    if (items.length === 0) {
      return null
    }
    return items[0]
  }
  async getByEmailWithDetails(email: string): Promise<UserWithDetailsDto | null> {
    const items = await payload.db.tables.users.findMany({
      where: eq(payload.db.tables.users.email, email),
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
    const items = await payload.db.tables.users
      .select({ passwordHash: payload.db.tables.users.passwordHash })
      .from(payload.db.tables.users)
      .where(eq(payload.db.tables.users.id, id))
      .execute()
    return items.length === 0 ? null : items[0].passwordHash
  }
  async getVerifyToken(id: string): Promise<string | null> {
    const items = await payload.db.tables.users
      .select({ verifyToken: payload.db.tables.users.verifyToken })
      .from(payload.db.tables.users)
      .where(eq(payload.db.tables.users.user_id, id))
      .execute()
    return items.length === 0 ? null : items[0].verifyToken
  }
  async count(): Promise<number> {
    return payload.db.tables
      .select({ count: count() })
      .from(payload.db.tables.users)
      .execute()
      .then((items: { count: any }[]) => items[0].count)
  }
  async create(data: Omit<UserModel, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = createId()
    await payload.db.tables.users.insert({
      id,
      created_at: new Date(),
      updated_at: new Date(),
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      active: data.active,
      admin: data.admin,
      avatar: data.avatar,
      locale: data.locale,
      phone: data.phone,
      defaultTenantId: data.defaultTenantId,
    })
    return id
  }
  async update(
    id: string,
    data: {
      firstName?: string
      lastName?: string
      avatar?: string | null
      verifyToken?: string | null
      passwordHash?: string
    },
  ): Promise<void> {
    await payload.db.tables
      .update(payload.db.tables.user)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
        verifyToken: data.verifyToken,
        passwordHash: data.passwordHash,
      })
      .where(eq(payload.db.tables.users.user_id, id))
      .execute()
  }
  async del(id: string): Promise<void> {
    await payload.db.tables.users.delete().where(eq(payload.db.tables.users.id, id)).execute()
  }
  async deleteAll(): Promise<void> {
    await payload.db.tables.users.delete().execute()
  }
}
