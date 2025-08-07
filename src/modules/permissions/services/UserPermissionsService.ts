import { db } from '@/db'
import { DefaultPermission } from '@/modules/permissions/data/DefaultPermission'
import { getUserInfo } from '@/lib/services/session.server'

export async function verifyUserHasPermission(
  permissionName: DefaultPermission,
  tenantId: string | null = null,
) {
  const userInfo = await getUserInfo()
  if (!userInfo.user_id) {
    throw Error('Unauthorized')
  }
  const permission = await db.permission.getByName(permissionName)
  if (permission) {
    const userPermission =
      (await db.userRole.countPermissionByUser(userInfo.user_id, tenantId, permissionName)) > 0
    if (!userPermission) {
      throw Error('Unauthorized')
    }
  }
  return true
}
