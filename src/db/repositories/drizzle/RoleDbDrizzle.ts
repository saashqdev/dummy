import payload from 'payload'
import { and, eq, inArray, like, max, sql, SQL } from 'drizzle-orm'
import { role, permission, role_permission, user } from '@/db/schema'
import { IRoleDb } from '@/db/interfaces/permissions/IRoleDb'
import { RoleWithPermissionsDto, RoleModel, RoleWithPermissionsAndUsersDto } from '@/db/models'
import { count } from 'drizzle-orm/sql'
import { createId } from '@paralleldrive/cuid2'

export class RoleDbDrizzle implements IRoleDb {
  async getAll(type?: 'admin' | 'app'): Promise<RoleWithPermissionsDto[]> {
    const whereConditions: SQL[] = type ? [eq(role.type, type)] : []
    const roles = await payload.db.tables.role.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        permissions: {
          with: {
            permission: true,
          },
        },
      },
      orderBy: [role.type, role.order],
    })
    return roles
  }

  async getAllNames(): Promise<{ id: string; name: string }[]> {
    const roles = await payload.db.tables.role.findMany({
      columns: {
        id: true,
        name: true,
      },
      orderBy: [role.type, role.order],
    })
    return roles
  }

  async getAllWithoutPermissions(type?: 'admin' | 'app'): Promise<RoleModel[]> {
    const whereConditions: SQL[] = type ? [eq(role.type, type)] : []
    const roles = await payload.db.tables.role.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [role.type, role.order],
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
      whereConditions.push(eq(role.type, filters.type))
    }

    if (filters?.name) {
      whereConditions.push(like(role.name, `%${filters.name}%`))
    }

    if (filters?.description) {
      whereConditions.push(like(role.description, `%${filters.description}%`))
    }

    if (filters?.permission_id) {
      const permissionSubquery = payload.db.tables.role_permission
        .select({ role_id: role_permission.role_id })
        .from(role_permission)
        .where(eq(role_permission.permission_id, filters.permission_id))
      whereConditions.push(inArray(role.id, permissionSubquery))
    }

    const roles = await payload.db.tables.role.findMany({
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
      orderBy: [role.type, role.order],
    })

    return roles
  }

  async getAllInIds(ids: string[]): Promise<RoleWithPermissionsAndUsersDto[]> {
    const roles = await payload.db.tables.role.findMany({
      where: inArray(role.id, ids),
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
      orderBy: [role.type, role.order],
    })
    return roles
  }

  async get(id: string): Promise<RoleWithPermissionsDto | null> {
    const roles = await payload.db.tables.role.findMany({
      where: eq(role.id, id),
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
    const roles = await payload.db.tables.role.findMany({
      where: eq(role.name, name),
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
    const whereConditions: SQL[] = type ? [eq(role.type, type)] : []
    const maxOrderResult = await payload.db.tables.role
      .select({ maxOrder: max(role.order) })
      .from(role)
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
    await payload.db.tables.insert(role).values({
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
    await payload.db.tables
      .update(role)
      .set({
        name: data.name,
        description: data.description,
        type: data.type,
        assign_to_new_users: data.assign_to_new_users,
      })
      .where(eq(role.id, id))
      .execute()
  }

  async del(id: string): Promise<void> {
    await payload.db.tables.delete(role).where(eq(role.id, id)).execute()
  }
}
