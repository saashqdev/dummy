import { db } from '@/db'
import { PermissionDto } from '@/db/models'
import { cachified, clearCacheKey } from '@/lib/services/cache.server'

export async function getPermissionName(name: string): Promise<PermissionDto | null> {
  return await cachified({
    key: `permission:${name}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.permission.getByName(name),
  })
}

export async function createPermissions(
  permissions: { in_roles: string[]; name: string; description: string; type: string }[],
  fromOrder: number = 0,
): Promise<void> {
  const allRolePermissions = await db.rolePermission.getAll()
  let allPermissions = await db.permission.getAll()
  let createdPermissionNames: string[] = []
  await Promise.all(
    permissions.map(async (data, idx) => {
      const existing = allPermissions.find((p) => p.name === data.name)
      if (existing || createdPermissionNames.includes(data.name)) {
        // eslint-disable-next-line no-console
        console.log('ℹ️ Permission name already exists: ' + data.name)
        return
      }
      const permissionId = await db.permission.create({
        order: fromOrder + idx + 1,
        name: data.name,
        description: data.description,
        type: data.type,
        isDefault: true,
      })
      const permission = await db.permission.get(permissionId)
      if (!permission) {
        throw new Error('Could not create permission: ' + data.name)
      }
      createdPermissionNames.push(permission.name)

      await Promise.all(
        data.in_roles.map(async (inRole) => {
          const role = await db.role.getByName(inRole)
          if (!role) {
            throw new Error('Role required: ' + inRole)
          }
          const existing = allRolePermissions.find(
            (p) => p.roleId === role.id && p.permission.name === permission.name,
          )
          if (existing) {
            return existing
          }
          await createRolePermission({
            permissionId: permission.id,
            roleId: role.id,
          })
        }),
      )
    }),
  )
}

export async function updatePermission(
  id: string,
  data: {
    name?: string
    description?: string
    type?: string
    order?: number
  },
): Promise<void> {
  const item = await db.permission.get(id)
  if (!item) {
    return
  }
  await db.permission.update(id, data).then(() => {
    clearCacheKey(`permission:${item.name}`)
    clearCacheKey(`permission:${data.name}`)
  })
}

export async function deletePermission(id: string): Promise<void> {
  const item = await db.permission.get(id)
  if (!item) {
    return
  }
  await db.permission.del(id).then(() => {
    clearCacheKey(`permission:${item.name}`)
  })
}

export async function createRolePermission(data: {
  roleId: string
  permissionId: string
}): Promise<string> {
  const existing = await db.rolePermission.get(data.roleId, data.permissionId)
  if (existing) {
    return existing.id
  }
  return await db.rolePermission.create({
    roleId: data.roleId,
    permissionId: data.permissionId,
  })
}

export async function setRolePermissions(roleId: string, permissionNames: string[]): Promise<void> {
  await db.rolePermission.deleteByRoleId(roleId)

  permissionNames.map(async (name) => {
    const permission = await db.permission.getByName(name)
    if (permission) {
      await db.rolePermission.create({
        roleId,
        permissionId: permission.id,
      })
    }
  })
}

export async function setPermissionRoles(permissionId: string, roleNames: string[]): Promise<void> {
  await db.rolePermission.deleteByPermissionId(permissionId)

  roleNames.map(async (name) => {
    const role = await db.role.getByName(name)
    if (role) {
      await db.rolePermission.create({
        roleId: role.id,
        permissionId,
      })
    }
  })
}
