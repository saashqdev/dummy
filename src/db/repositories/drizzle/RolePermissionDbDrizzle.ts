import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, eq } from 'drizzle-orm'
import { role_permission } from '@/db/schema'
import { IRolePermissionDb } from '@/db/interfaces/permissions/IRolePermissionDb'
import { RolePermissionWithPermissionDto } from '@/db/models'

export class RolePermissionDbDrizzle implements IRolePermissionDb {
  async getAll(): Promise<RolePermissionWithPermissionDto[]> {
    return await payload.db.tables.role_permission.findMany({
      with: {
        permission: true,
      },
    })
  }

  async get(
    role_id: string,
    permission_id: string,
  ): Promise<RolePermissionWithPermissionDto | null> {
    const results = await payload.db.tables.role_permission.findMany({
      where: and(
        eq(role_permission.role_id, role_id),
        eq(role_permission.permission_id, permission_id),
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
    await payload.db.tables.insert(role_permission).values({
      id,
      role_id: data.role_id,
      permission_id: data.permission_id,
    })
    return id
  }

  async deleteByRoleId(role_id: string): Promise<void> {
    await payload.db.tables.delete(role_permission).where(eq(role_permission.role_id, role_id))
  }

  async deleteByPermissionId(permission_id: string): Promise<void> {
    await payload.db.tables
      .delete(role_permission)
      .where(eq(role_permission.permission_id, permission_id))
  }
}
