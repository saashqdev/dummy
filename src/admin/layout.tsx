import { DefaultPermission } from '@/modules/permissions/data/DefaultPermission'
import { getUserInfo } from '@/lib/services/session.server'
import { AdminDataDto } from '@/lib/state/useAdminData'
import { promiseHash } from '@/lib/utils'
import { getUser } from '@/modules/accounts/services/UserService'
import { AdminRoleEnum } from '@/modules/permissions/enums/AdminRoleEnum'
import {
  getPermissionsByUser,
  getUserRoleInAdmin,
} from '@/modules/permissions/services/UserRolesService'
import SidebarLayout from '@/components/layouts/SidebarLayout'
import AdminDataLayout from '@/context/AdminDataLayout'
import { redirect } from 'next/navigation'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { getCurrentUrl } from '@/lib/services/url.server'

const loader = async ({}: IServerComponentsProps): Promise<AdminDataDto> => {
  const userInfo = await getUserInfo()
  const user = userInfo.userId ? await getUser(userInfo.userId) : null
  const url = new URL(await getCurrentUrl())
  const redirectTo = url.pathname + url.search
  if (!userInfo || !user || !userInfo.userId) {
    let searchParams = new URLSearchParams([['redirect', redirectTo]])
    throw redirect(`/login?${searchParams.toString()}`)
  }

  if (!user.admin) {
    throw new Error('Only admins can access this page')
    // throw json({ error: "Only admins can access this page" }, { status: 401 });
  }

  const { allPermissions, superAdminRole } = await promiseHash({
    allPermissions: getPermissionsByUser(userInfo.userId, null),
    superAdminRole: getUserRoleInAdmin(userInfo.userId, AdminRoleEnum.SuperAdmin),
  })
  const data: AdminDataDto = {
    user,
    permissions: allPermissions.map((f) => f as DefaultPermission),
    isSuperAdmin: !!superAdminRole,
  }
  return data
}

export default async function (
  props: IServerComponentsProps,
  { children }: { children: React.ReactNode },
) {
  const adminData = await loader(props)
  return (
    <AdminDataLayout data={adminData}>
      <SidebarLayout layout="admin">{children}</SidebarLayout>
    </AdminDataLayout>
  )
}
