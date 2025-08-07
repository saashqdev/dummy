'use server'

import { FilterablePropertyDto } from '@/lib/dtos/FilterablePropertyDto'
import { getStringFilter } from '@/lib/helpers/PaginationHelper'
import { PermissionWithRolesDto, RoleWithPermissionsDto, UserWithDetailsDto } from '@/db/models'
import { db } from '@/db'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import Component from './component'
import { revalidatePath } from 'next/cache'
import { createUserRole, deleteUserRole } from '@/modules/permissions/services/UserRolesService'
import { AdminRoleEnum } from '@/modules/permissions/enums/AdminRoleEnum'
import { getUserInfo } from '@/lib/services/session.server'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.role.adminRoles')} | ${defaultSiteTags.title}`,
  })
}

export type AdminRolesAdminUsersLoaderData = {
  items: UserWithDetailsDto[]
  roles: RoleWithPermissionsDto[]
}

const loader = async (props: IServerComponentsProps) => {
  const searchParams = await props.searchParams
  await verifyUserHasPermission('admin.roles.update')
  const { t } = await getServerTranslations()

  const items = (await db.user.getAll()).filter((f) => f.admin)
  const roles = await db.role.getAll('admin')

  const data: AdminRolesAdminUsersLoaderData = {
    items,
    roles,
  }
  return data
}

export const actionAdminRolesAdminUsers = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.roles.update')
  const { t } = await getServerTranslations()
  const userInfo = await getUserInfo()

  const action = form.get('action')?.toString() ?? ''
  if (action === 'edit') {
    const user_id = form.get('user-id')?.toString() ?? ''
    const roleId = form.get('role-id')?.toString() ?? ''
    const add = form.get('add') === 'true'

    if (add) {
      await createUserRole({ user_id, roleId, tenantId: null })
    } else {
      const role = await db.role.get(roleId)
      if (role?.name === AdminRoleEnum.SuperAdmin && userInfo.user_id === user_id) {
        return { error: "You can't remove Super Admin role from yourself" }
      }
      await deleteUserRole({ user_id, roleId, tenantId: null })
    }
    revalidatePath('/admin/accounts/roles-and-permissions/admin-users')
    return { success: t('shared.updated') }
  } else {
    return { error: t('shared.invalidForm') }
  }
}

export default async function ({ searchParams, children }: IServerComponentsProps) {
  const data = await loader({ searchParams })
  return <Component data={data}>{children}</Component>
}
