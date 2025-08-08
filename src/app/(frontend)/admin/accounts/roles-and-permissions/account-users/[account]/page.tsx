'use server'

import { RoleWithPermissionsDto, TenantModel, UserWithRolesDto } from '@/db/models'
import { db } from '@/db'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import Component from './component'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { getTenant } from '@/modules/accounts/services/TenantService'
import { redirect } from 'next/navigation'
import { createUserRole, deleteUserRole } from '@/modules/permissions/services/UserRolesService'
import { revalidatePath } from 'next/cache'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.role.adminRoles')} | ${defaultSiteTags.title}`,
  })
}

export type AdminAccountUsersAccountLoaderData = {
  tenant: TenantModel
  items: UserWithRolesDto[]
  roles: RoleWithPermissionsDto[]
}

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params
  await verifyUserHasPermission('admin.roles.set')
  const { t } = await getServerTranslations()

  const tenant = await getTenant(params?.account!)
  if (!tenant) {
    return redirect('/admin/accounts/roles-and-permissions/account-users')
  }

  const adminUsers = (await db.user.getAll()).filter((f) => f.admin)
  const tenantUsers = await db.user.getAllWhereTenant(params?.account!)
  const roles = await db.role.getAll('app')

  const items: UserWithRolesDto[] = []
  adminUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user)
    }
  })
  tenantUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user)
    }
  })

  const data: AdminAccountUsersAccountLoaderData = {
    items,
    roles,
    tenant,
  }
  return data
}

export const actionAdminAccountUsersAccount = async (prev: any, form: FormData) => {
  const tenantId = form.get('tenantId')?.toString() ?? ''
  if (!tenantId) {
    return { error: 'Invalid account ID' }
  }
  await verifyUserHasPermission('admin.roles.set')
  const { t } = await getServerTranslations()

  const action = form.get('action')?.toString() ?? ''
  if (action === 'edit') {
    const user_id = form.get('user-id')?.toString() ?? ''
    const roleId = form.get('role-id')?.toString() ?? ''
    const add = form.get('add') === 'true'

    if (add) {
      await createUserRole({ userId: user_id, roleId, tenantId: tenantId })
    } else {
      await deleteUserRole({ userId: user_id, roleId, tenantId: tenantId })
    }
    revalidatePath(`/admin/accounts/roles-and-permissions/account-users/${tenantId}`)
    return { success: t('shared.updated') }
  } else {
    return { error: t('shared.invalidForm') }
  }
}

export default async function ({ params }: IServerComponentsProps) {
  const data = await loader({ params })
  return <Component data={data} />
}
