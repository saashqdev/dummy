import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, eq, inArray, max, asc, SQL } from 'drizzle-orm'
import { permission, role_permission } from '@/db/schema'
import { IPermissionDb } from '@/db/interfaces/permissions/IPermissionDb'
import { PermissionWithRolesDto, PermissionDto } from '@/db/models'

export class PermissionDbDrizzle implements IPermissionDb {
  async getAll(filters?: {
    type?: string
    role_id?: string | null
  }): Promise<PermissionWithRolesDto[]> {
    let whereConditions: SQL[] = []

    if (filters?.type) {
      whereConditions.push(eq(permission.type, filters.type))
    }

    if (filters?.role_id) {
      const rolePermissionSubquery = payload.db.tables
        .select({ permission_id: role_permission.permission_id })
        .from(role_permission)
        .where(eq(role_permission.role_id, filters.role_id))
      whereConditions.push(inArray(permission.id, rolePermissionSubquery))
    }

    return await payload.db.tables.permission.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        in_roles: {
          with: {
            role: true,
          },
        },
      },
      orderBy: [asc(permission.type), asc(permission.name)],
    })
  }

  async getAllIdsAndNames(): Promise<PermissionDto[]> {
    return await payload.db.tables.permission
      .select({
        id: permission.id,
        name: permission.name,
        description: permission.description,
      })
      .from(permission)
      .orderBy(asc(permission.name))
  }

  async get(id: string): Promise<PermissionWithRolesDto | null> {
    const results = await payload.db.tables.permission.findMany({
      where: eq(permission.id, id),
      with: {
        in_roles: {
          with: {
            role: true,
          },
        },
      },
    })
    return results.length > 0 ? results[0] : null
  }

  async getByName(name: string): Promise<PermissionDto | null> {
    const results = await payload.db.tables.permission
      .select({
        id: permission.id,
        name: permission.name,
        description: permission.description,
      })
      .from(permission)
      .where(eq(permission.name, name))
      .limit(1)

    return results.length > 0 ? results[0] : null
  }

  async getMaxOrder(type: 'admin' | 'app'): Promise<number> {
    const result = await payload.db.tables.permission
      .select({ maxOrder: max(permission.order) })
      .from(permission)
      .where(eq(permission.type, type))
    return result[0].maxOrder ?? 0
  }

  async create(data: {
    order: number
    name: string
    description: string
    type: string
    is_default: boolean
  }): Promise<string> {
    const id = createId()
    await payload.db.tables.permission.insert().values({
      id,
      created_at: new Date(),
      updated_at: new Date(),
      order: data.order,
      name: data.name,
      description: data.description,
      type: data.type,
      is_default: data.is_default,
    })
    return id
  }

  async update(
    id: string,
    data: {
      name?: string
      description?: string
      type?: string
      order?: number
    },
  ): Promise<void> {
    await payload.db.tables
      .update(permission)
      .set({
        name: data.name,
        description: data.description,
        type: data.type,
        order: data.order,
      })
      .where(eq(permission.id, id))
  }

  async del(id: string): Promise<void> {
    await payload.db.tables.delete(permission).where(eq(permission.id, id))
  }
}
