import { UserRoleModel } from '@/db/models'
import { cachified, clearCacheKey } from '@/lib/services/cache.server'
import { db } from '@/db'

export async function getUserRoleInAdmin(
  userId: string,
  roleName: string,
): Promise<UserRoleModel | null> {
  return await cachified({
    key: `userRole:${userId}:${roleName}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.userRole.getInAdmin(userId, roleName),
  })
}

export async function getPermissionsByUser(
  userId: string,
  tenantId: string | null,
): Promise<string[]> {
  const userRoles = await cachified({
    key: `userRoles:${userId}:${tenantId}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.userRole.getPermissionsByUser(userId, tenantId),
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
  const existing = await db.userRole.get({
    userId: data.userId,
    role_id: data.roleId,
    tenant_id: data.tenantId,
  })
  if (existing) {
    return existing.id
  }
  return await db.userRole
    .create({
      userId: data.userId,
      role_id: data.roleId,
      tenant_id: data.tenantId,
    })
    .then((id) => {
      clearCacheKey(`userRoles:${data.userId}:${data.tenantId}`)
      return id
    })
}

export async function createUserRoles(
  userId: string,
  roles: { id: string; tenantId: string | null }[],
): Promise<void> {
  const uniqueTenantIds = [...new Set(roles.map((role) => role.tenantId))]
  await db.userRole
    .createMany(
      userId,
      roles.map((role) => ({
        id: role.id,
        tenant_id: role.tenantId,
      })),
    )
    .then(() => {
      uniqueTenantIds.forEach((tenantId) => {
        clearCacheKey(`userRoles:${userId}:${tenantId}`)
      })
    })
}

export async function deleteUserRole({
  userId,
  roleId,
  tenantId,
}: {
  userId: string
  roleId: string
  tenantId: string | null
}): Promise<void> {
  await db.userRole.del(userId, roleId).then((item) => {
    clearCacheKey(`userRoles:${userId}:${tenantId}`)
    return item
  })
}
