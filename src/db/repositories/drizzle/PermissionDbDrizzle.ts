import { createId } from '@paralleldrive/cuid2'
import { and, eq, inArray, max, asc, SQL } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { Permission, RolePermission } from '@/db/config/drizzle/schema'
import { IPermissionDb } from '@/db/interfaces/permissions/IPermissionDb'
import { PermissionWithRolesDto, PermissionDto } from '@/db/models'

export class PermissionDbDrizzle implements IPermissionDb {
  async getAll(filters?: {
    type?: string
    role_id?: string | null
  }): Promise<PermissionWithRolesDto[]> {
    let whereConditions: SQL[] = []

    if (filters?.type) {
      whereConditions.push(eq(Permission.type, filters.type))
    }

    if (filters?.role_id) {
      const rolePermissionSubquery = drizzleDb
        .select({ permission_id: RolePermission.permission_id })
        .from(RolePermission)
        .where(eq(RolePermission.role_id, filters.role_id))
      whereConditions.push(inArray(Permission.id, rolePermissionSubquery))
    }

    return await drizzleDb.query.Permission.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        in_roles: {
          with: {
            role: true,
          },
        },
      },
      orderBy: [asc(Permission.type), asc(Permission.name)],
    })
  }

  async getAllIdsAndNames(): Promise<PermissionDto[]> {
    return await drizzleDb
      .select({
        id: Permission.id,
        name: Permission.name,
        description: Permission.description,
      })
      .from(Permission)
      .orderBy(asc(Permission.name))
  }

  async get(id: string): Promise<PermissionWithRolesDto | null> {
    const results = await drizzleDb.query.Permission.findMany({
      where: eq(Permission.id, id),
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
    const results = await drizzleDb
      .select({
        id: Permission.id,
        name: Permission.name,
        description: Permission.description,
      })
      .from(Permission)
      .where(eq(Permission.name, name))
      .limit(1)

    return results.length > 0 ? results[0] : null
  }

  async getMaxOrder(type: 'admin' | 'app'): Promise<number> {
    const result = await drizzleDb
      .select({ maxOrder: max(Permission.order) })
      .from(Permission)
      .where(eq(Permission.type, type))
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
    await drizzleDb.insert(Permission).values({
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
    await drizzleDb
      .update(Permission)
      .set({
        name: data.name,
        description: data.description,
        type: data.type,
        order: data.order,
      })
      .where(eq(Permission.id, id))
  }

  async del(id: string): Promise<void> {
    await drizzleDb.delete(Permission).where(eq(Permission.id, id))
  }
}
