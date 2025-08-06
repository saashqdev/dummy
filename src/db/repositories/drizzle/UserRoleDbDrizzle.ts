import { and, eq, isNull, inArray, count } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { UserRole, Role, RolePermission, Permission } from '@/db/config/drizzle/schema'
import { IUserRoleDb } from '../../interfaces/permissions/IUserRoleDb'
import { UserRoleModel, UserRoleWithDetailsDto } from '../../models'
import { createId } from '@paralleldrive/cuid2'

export class UserRoleDbDrizzle implements IUserRoleDb {
  async get(params: {
    user_id: string
    role_id: string
    tenant_id: string | null
  }): Promise<UserRoleModel | null> {
    const conditions = [eq(UserRole.user_id, params.user_id), eq(UserRole.role_id, params.role_id)]

    if (params.tenant_id === null) {
      conditions.push(isNull(UserRole.tenant_id))
    } else {
      conditions.push(eq(UserRole.tenant_id, params.tenant_id))
    }

    const result = await drizzleDb
      .select()
      .from(UserRole)
      .where(and(...conditions))
      .limit(1)
    return result.length > 0 ? result[0] : null
  }

  async getInTenant(
    user_id: string,
    tenant_id: string,
    role_name: string,
  ): Promise<UserRoleModel | null> {
    const result = await drizzleDb
      .select()
      .from(UserRole)
      .innerJoin(Role, eq(UserRole.role_id, Role.id))
      .where(
        and(
          eq(UserRole.user_id, user_id),
          eq(UserRole.tenant_id, tenant_id),
          eq(Role.name, role_name),
        ),
      )
      .limit(1)
    return result.length > 0 ? result[0].UserRole : null
  }

  async getInAdmin(user_id: string, role_name: string): Promise<UserRoleModel | null> {
    const result = await drizzleDb
      .select()
      .from(UserRole)
      .innerJoin(Role, eq(UserRole.role_id, Role.id))
      .where(
        and(eq(UserRole.user_id, user_id), isNull(UserRole.tenant_id), eq(Role.name, role_name)),
      )
      .limit(1)
    return result.length > 0 ? result[0].UserRole : null
  }

  async getPermissionsByUser(
    user_id: string,
    tenant_id: string | null,
  ): Promise<UserRoleWithDetailsDto[]> {
    const conditions = [eq(UserRole.user_id, user_id)]
    if (tenant_id === null) {
      conditions.push(isNull(UserRole.tenant_id))
    } else {
      conditions.push(eq(UserRole.tenant_id, tenant_id))
    }

    return await drizzleDb.query.UserRole.findMany({
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
    user_id: string,
    tenant_id: string | null,
    permission_name: string,
  ): Promise<number> {
    const subquery = drizzleDb
      .select({ role_id: UserRole.role_id })
      .from(UserRole)
      .where(
        and(
          eq(UserRole.user_id, user_id),
          tenant_id === null ? isNull(UserRole.tenant_id) : eq(UserRole.tenant_id, tenant_id),
        ),
      )

    const result = await drizzleDb
      .select({ count: count() })
      .from(Permission)
      .innerJoin(RolePermission, eq(Permission.id, RolePermission.permission_id))
      .where(and(eq(Permission.name, permission_name), inArray(RolePermission.role_id, subquery)))

    return result[0].count
  }

  async create(data: {
    user_id: string
    role_id: string
    tenant_id: string | null
  }): Promise<string> {
    const id = createId()
    await drizzleDb.insert(UserRole).values({
      id,
      created_at: new Date(),
      user_id: data.user_id,
      role_id: data.role_id,
      tenant_id: data.tenant_id,
    })
    return id
  }

  async createMany(
    user_id: string,
    roles: { id: string; tenant_id: string | null }[],
  ): Promise<void> {
    if (roles.length === 0) {
      return
    }
    await drizzleDb.insert(UserRole).values(
      roles.map((role) => ({
        id: createId(),
        created_at: new Date(),
        user_id,
        role_id: role.id,
        tenant_id: role.tenant_id,
      })),
    )
  }

  async del(user_id: string, role_id: string): Promise<void> {
    await drizzleDb
      .delete(UserRole)
      .where(and(eq(UserRole.user_id, user_id), eq(UserRole.role_id, role_id)))
  }

  async deleteAllByUser(user_id: string, type: string): Promise<void> {
    const subquery = drizzleDb.select({ id: Role.id }).from(Role).where(eq(Role.type, type))

    await drizzleDb
      .delete(UserRole)
      .where(and(eq(UserRole.user_id, user_id), inArray(UserRole.role_id, subquery)))
  }
}
