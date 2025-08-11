import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, eq } from 'drizzle-orm'
import { IRolePermissionDb } from '@/db/interfaces/permissions/IRolePermissionDb'
import { RolePermissionWithPermissionDto } from '@/db/models'

export class RolePermissionDbDrizzle implements IRolePermissionDb {
  async getAll(): Promise<RolePermissionWithPermissionDto[]> {
    return await payload.db.tables.roles.findMany({
      with: {
        permission: true,
      },
    })
  }

  async get(
    role_id: string,
    permission_id: string,
  ): Promise<RolePermissionWithPermissionDto | null> {
    const results = await payload.db.tables.roles.findMany({
      where: and(
        eq(payload.db.tables.roles.role_id, role_id),
        eq(payload.db.tables.roles.permissions.id, permission_id),
      ),
      with: {
        permission: true,
      },
      limit: 1,
    })

    return results.length > 0 ? results[0] : null
  }

  async create(data: { role_id: string; permission_id: string }): Promise<string> {
    const id = createId()
    await payload.db.tables.insert(payload.db.tables.roles).values({
      id,
      roleId: data.role_id,
      permissionId: data.permission_id,
    })
    return id
  }

  async deleteByRoleId(role_id: string): Promise<void> {
    await payload.db.tables
      .delete(payload.db.tables.roles)
      .where(eq(payload.db.tables.roles.role_id, role_id))
  }

  async deleteByPermissionId(permission_id: string): Promise<void> {
    await payload.db.tables
      .delete(payload.db.tables.roles)
      .where(eq(payload.db.tables.roles.permissions.id, permission_id))
  }
}
