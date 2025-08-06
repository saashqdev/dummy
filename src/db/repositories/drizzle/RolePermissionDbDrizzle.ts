import { createId } from '@paralleldrive/cuid2'
import { and, eq } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { RolePermission, Permission } from '@/db/config/drizzle/schema'
import { IRolePermissionDb } from '@/db/interfaces/permissions/IRolePermissionDb'
import { RolePermissionWithPermissionDto } from '@/db/models'

export class RolePermissionDbDrizzle implements IRolePermissionDb {
  async getAll(): Promise<RolePermissionWithPermissionDto[]> {
    return await drizzleDb.query.RolePermission.findMany({
      with: {
        permission: true,
      },
    })
  }

  async get(
    role_id: string,
    permission_id: string,
  ): Promise<RolePermissionWithPermissionDto | null> {
    const results = await drizzleDb.query.RolePermission.findMany({
      where: and(
        eq(RolePermission.role_id, role_id),
        eq(RolePermission.permission_id, permission_id),
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
    await drizzleDb.insert(RolePermission).values({
      id,
      role_id: data.role_id,
      permission_id: data.permission_id,
    })
    return id
  }

  async deleteByRoleId(role_id: string): Promise<void> {
    await drizzleDb.delete(RolePermission).where(eq(RolePermission.role_id, role_id))
  }

  async deleteByPermissionId(permission_id: string): Promise<void> {
    await drizzleDb.delete(RolePermission).where(eq(RolePermission.permission_id, permission_id))
  }
}
