import { UserRoleModel } from '@/db/models'
import { cachified, clearCacheKey } from '@/lib/services/cache.server'
import { db } from '@/db'

export async function getUserRoleInAdmin(
  userId: string,
  roleName: string,
): Promise<UserRoleModel | null> {
  return await cachified({
    key: `userRole:${user_id}:${roleName}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.userRole.getInAdmin(user_id, roleName),
  })
}

export async function getPermissionsByUser(
  userId: string,
  tenantId: string | null,
): Promise<string[]> {
  const userRoles = await cachified({
    key: `userRoles:${user_id}:${tenantId}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.userRole.getPermissionsByUser(user_id, tenantId),
  })
  const roles: string[] = []
  const names: string[] = []
  userRoles.forEach((userRoles) => {
    if (!roles.includes(userRoles.role.name)) {
      roles.push(userRoles.role.name)
    }
    userRoles.role.permissions.forEach((permission) => {
      if (!names.includes(permission.permission.name)) {
        names.push(permission.permission.name)
      }
    })
  })
  return names
}

export async function createUserRole(data: {
  userId: string
  roleId: string
  tenantId: string | null
}): Promise<string> {
  const existing = await db.userRole.get(data)
  if (existing) {
    return existing.id
  }
  return await db.userRole
    .create({
      userId: data.user_id,
      roleId: data.roleId,
      tenantId: data.tenantId,
    })
    .then((id) => {
      clearCacheKey(`userRoles:${data.user_id}:${data.tenantId}`)
      return id
    })
}

export async function createUserRoles(
  userId: string,
  roles: { id: string; tenantId: string | null }[],
): Promise<void> {
  const uniqueTenantIds = [...new Set(roles.map((role) => role.tenantId))]
  await db.userRole.createMany(user_id, roles).then(() => {
    uniqueTenantIds.forEach((tenantId) => {
      clearCacheKey(`userRoles:${user_id}:${tenantId}`)
    })
  })
}

export async function deleteUserRole({
  user_id,
  roleId,
  tenantId,
}: {
  userId: string
  roleId: string
  tenantId: string | null
}): Promise<void> {
  await db.userRole.del(user_id, roleId).then((item) => {
    clearCacheKey(`userRoles:${user_id}:${tenantId}`)
    return item
  })
}
