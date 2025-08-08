'use server'

import { PermissionWithRolesDto } from '@/db/models'
import { db } from '@/db'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import Component from './component'
import { redirect } from 'next/navigation'
import { createRole } from '@/modules/permissions/services/RolesService'
import { setRolePermissions } from '@/modules/permissions/services/PermissionsService'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.role.object')} | ${defaultSiteTags.title}`,
  })
}

export type AdminRolesNewLoaderData = {
  permissions: PermissionWithRolesDto[]
}

const loader = async ({}: IServerComponentsProps) => {
  await verifyUserHasPermission('admin.roles.update')

  const permissions = await db.permission.getAll()
  const data: AdminRolesNewLoaderData = {
    permissions,
  }
  return data
}

export const actionAdminRolesNew = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.roles.create')
  const { t } = await getServerTranslations()

  const action = form.get('action')?.toString() ?? ''
  if (action === 'create') {
    const name = form.get('name')?.toString() ?? ''
    const description = form.get('description')?.toString() ?? ''
    const assignToNewUsers = Boolean(form.get('assign-to-new-users'))
    const type: 'admin' | 'app' = form.get('type')?.toString() === 'admin' ? 'admin' : 'app'
    const permissions = form.getAll('permissions[]').map((f) => f.toString())
    if (permissions.length === 0) {
      return { error: 'At least one permission is required.' }
    }

    const existing = await db.role.getByName(name)
    if (existing) {
      return { error: 'Existing role with name: ' + name }
    }

    const order = (await db.role.getMaxOrder(type)) + 1
    const data = {
      order,
      name,
      description,
      assignToNewUsers,
      type,
      isDefault: false,
    }
    const roleId = await createRole(data)
    await setRolePermissions(roleId, permissions)
  } else {
    return { error: t('shared.invalidForm') }
  }
  return redirect('/admin/accounts/roles-and-permissions/roles')
}

export default async function (props: IServerComponentsProps) {
  const data = await loader(props)
  return <Component data={data} />
}
