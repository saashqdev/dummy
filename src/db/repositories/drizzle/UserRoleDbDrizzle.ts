import payload from 'payload'
import { and, eq, isNull, inArray, count } from 'drizzle-orm'
import { user_role, role_permission, permission } from '@/db/schema'
import { IUserRoleDb } from '../../interfaces/permissions/IUserRoleDb'
import { UserRoleModel, UserRoleWithDetailsDto } from '../../models'
import { createId } from '@paralleldrive/cuid2'

export class UserRoleDbDrizzle implements IUserRoleDb {
  async get(params: {
    userId: string
    role_id: string
    tenant_id: string | null
  }): Promise<UserRoleModel | null> {
    const conditions = [eq(user_role.userId, params.userId), eq(user_role.role_id, params.role_id)]

    if (params.tenant_id === null) {
      conditions.push(isNull(user_role.tenant_id))
    } else {
      conditions.push(eq(user_role.tenant_id, params.tenant_id))
    }

    const result = await payload.db.tables
      .select()
      .from(user_role)
      .where(and(...conditions))
      .limit(1)
    return result.length > 0 ? result[0] : null
  }

  async getInTenant(
    userId: string,
    tenant_id: string,
    role_name: string,
  ): Promise<UserRoleModel | null> {
    const result = await payload.db.tables
      .select()
      .from(user_role)
      .innerJoin(payload.db.tables.roles, eq(user_role.role_id, payload.db.tables.roles.role_id))
      .where(
        and(
          eq(user_role.userId, userId),
          eq(user_role.tenant_id, tenant_id),
          eq(payload.db.tables.roles.name, role_name),
        ),
      )
      .limit(1)
    return result.length > 0 ? result[0].UserRole : null
  }

  async getInAdmin(userId: string, role_name: string): Promise<UserRoleModel | null> {
    const result = await payload.db.tables
      .select()
      .from(user_role)
      .innerJoin(payload.db.tables.roles, eq(user_role.role_id, payload.db.tables.roles.role_id))
      .where(
        and(
          eq(user_role.userId, userId),
          isNull(user_role.tenant_id),
          eq(payload.db.tables.roles.name, role_name),
        ),
      )
      .limit(1)
    return result.length > 0 ? result[0].UserRole : null
  }

  async getPermissionsByUser(
    userId: string,
    tenant_id: string | null,
  ): Promise<UserRoleWithDetailsDto[]> {
    const conditions = [eq(user_role.userId, userId)]
    if (tenant_id === null) {
      conditions.push(isNull(user_role.tenant_id))
    } else {
      conditions.push(eq(user_role.tenant_id, tenant_id))
    }

    return await payload.db.tables.user_role.findMany({
      where: and(...conditions),
      with: {
        role: {
          with: {
            permissions: {
              with: {
                permission: true,
              },
            },
          },
        },
      },
    })
  }

  async countPermissionByUser(
    userId: string,
    tenant_id: string | null,
    permission_name: string,
  ): Promise<number> {
    const subquery = payload.db.tables
      .select({ role_id: user_role.role_id })
      .from(user_role)
      .where(
        and(
          eq(user_role.userId, userId),
          tenant_id === null ? isNull(user_role.tenant_id) : eq(user_role.tenant_id, tenant_id),
        ),
      )

    const result = await payload.db.tables
      .select({ count: count() })
      .from(permission)
      .innerJoin(role_permission, eq(permission.id, role_permission.permission_id))
      .where(and(eq(permission.name, permission_name), inArray(role_permission.role_id, subquery)))

    return result[0].count
  }

  async create(data: {
    userId: string
    role_id: string
    tenant_id: string | null
  }): Promise<string> {
    const id = createId()
    await payload.db.tables.insert(user_role).values({
      id,
      created_at: new Date(),
      userId: data.userId,
      role_id: data.role_id,
      tenant_id: data.tenant_id,
    })
    return id
  }

  async createMany(
    userId: string,
    roles: { id: string; tenant_id: string | null }[],
  ): Promise<void> {
    if (roles.length === 0) {
      return
    }
    await payload.db.tables.insert(user_role).values(
      roles.map((role) => ({
        id: createId(),
        created_at: new Date(),
        userId: userId,
        role_id: role.id,
        tenant_id: role.tenant_id,
      })),
    )
  }

  async del(userId: string, role_id: string): Promise<void> {
    await payload.db.tables
      .delete(user_role)
      .where(and(eq(user_role.userId, userId), eq(user_role.role_id, role_id)))
  }

  async deleteAllByUser(userId: string, type: string): Promise<void> {
    const subquery = payload.db.tables
      .select({ id: payload.db.tables.roles.role_id })
      .from(payload.db.tables.roles)
      .where(eq(payload.db.tables.roles.type, type))

    await payload.db.tables
      .delete(user_role)
      .where(and(eq(user_role.userId, userId), inArray(user_role.role_id, subquery)))
  }
}
