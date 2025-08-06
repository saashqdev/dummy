import { and, eq, inArray, like, max, sql, SQL } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { Role, Permission, RolePermission, User } from '@/db/config/drizzle/schema'
import { IRoleDb } from '@/db/interfaces/permissions/IRoleDb'
import { RoleWithPermissionsDto, RoleModel, RoleWithPermissionsAndUsersDto } from '@/db/models'
import { count } from 'drizzle-orm/sql'
import { createId } from '@paralleldrive/cuid2'

export class RoleDbDrizzle implements IRoleDb {
  async getAll(type?: 'admin' | 'app'): Promise<RoleWithPermissionsDto[]> {
    const whereConditions: SQL[] = type ? [eq(Role.type, type)] : []
    const roles = await drizzleDb.query.Role.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        permissions: {
          with: {
            permission: true,
          },
        },
      },
      orderBy: [Role.type, Role.order],
    })
    return roles
  }

  async getAllNames(): Promise<{ id: string; name: string }[]> {
    const roles = await drizzleDb.query.Role.findMany({
      columns: {
        id: true,
        name: true,
      },
      orderBy: [Role.type, Role.order],
    })
    return roles
  }

  async getAllWithoutPermissions(type?: 'admin' | 'app'): Promise<RoleModel[]> {
    const whereConditions: SQL[] = type ? [eq(Role.type, type)] : []
    const roles = await drizzleDb.query.Role.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [Role.type, Role.order],
    })
    return roles
  }

  async getAllWithUsers(filters?: {
    type?: 'admin' | 'app'
    name?: string
    description?: string
    permission_id?: string | null
  }): Promise<RoleWithPermissionsAndUsersDto[]> {
    const whereConditions: SQL[] = []

    if (filters?.type) {
      whereConditions.push(eq(Role.type, filters.type))
    }

    if (filters?.name) {
      whereConditions.push(like(Role.name, `%${filters.name}%`))
    }

    if (filters?.description) {
      whereConditions.push(like(Role.description, `%${filters.description}%`))
    }

    if (filters?.permission_id) {
      const permissionSubquery = drizzleDb
        .select({ role_id: RolePermission.role_id })
        .from(RolePermission)
        .where(eq(RolePermission.permission_id, filters.permission_id))
      whereConditions.push(inArray(Role.id, permissionSubquery))
    }

    const roles = await drizzleDb.query.Role.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        permissions: {
          with: {
            permission: true,
          },
        },
        users: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [Role.type, Role.order],
    })

    return roles
  }

  async getAllInIds(ids: string[]): Promise<RoleWithPermissionsAndUsersDto[]> {
    const roles = await drizzleDb.query.Role.findMany({
      where: inArray(Role.id, ids),
      with: {
        permissions: {
          with: {
            permission: true,
          },
        },
        users: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [Role.type, Role.order],
    })
    return roles
  }

  async get(id: string): Promise<RoleWithPermissionsDto | null> {
    const roles = await drizzleDb.query.Role.findMany({
      where: eq(Role.id, id),
      with: {
        permissions: {
          with: {
            permission: true,
          },
        },
      },
    })

    return roles.length > 0 ? roles[0] : null
  }

  async getByName(name: string): Promise<RoleWithPermissionsDto | null> {
    const roles = await drizzleDb.query.Role.findMany({
      where: eq(Role.name, name),
      with: {
        permissions: {
          with: {
            permission: true,
          },
        },
      },
    })

    return roles.length > 0 ? roles[0] : null
  }

  async getMaxOrder(type?: 'admin' | 'app'): Promise<number> {
    const whereConditions: SQL[] = type ? [eq(Role.type, type)] : []
    const maxOrderResult = await drizzleDb
      .select({ maxOrder: max(Role.order) })
      .from(Role)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    if (maxOrderResult.length === 0) {
      return 0
    }
    return Number(maxOrderResult[0].maxOrder || 0)
  }

  async create(data: {
    order: number
    name: string
    description: string
    type: 'admin' | 'app'
    assign_to_new_users: boolean
    is_default: boolean
  }): Promise<string> {
    const id = createId()
    await drizzleDb.insert(Role).values({
      id,
      created_at: new Date(),
      updated_at: new Date(),
      order: data.order,
      name: data.name,
      description: data.description,
      type: data.type,
      assign_to_new_users: data.assign_to_new_users,
      is_default: data.is_default,
    })

    return id
  }

  async update(
    id: string,
    data: {
      name: string
      description: string
      type: 'admin' | 'app'
      assign_to_new_users: boolean
    },
  ): Promise<void> {
    await drizzleDb
      .update(Role)
      .set({
        name: data.name,
        description: data.description,
        type: data.type,
        assign_to_new_users: data.assign_to_new_users,
      })
      .where(eq(Role.id, id))
      .execute()
  }

  async del(id: string): Promise<void> {
    await drizzleDb.delete(Role).where(eq(Role.id, id)).execute()
  }
}
