'use server'

import { RoleWithPermissionsDto } from '@/db/models'
import { db } from '@/db'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import Component from './component'
import { redirect } from 'next/navigation'
import { setPermissionRoles } from '@/modules/permissions/services/PermissionsService'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.permission.object')} | ${defaultSiteTags.title}`,
  })
}

export type AdminPermissionsNewLoaderData = {
  roles: RoleWithPermissionsDto[]
}

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params
  await verifyUserHasPermission('admin.roles.create')
  const roles = await db.role.getAll()
  const data: AdminPermissionsNewLoaderData = {
    roles,
  }
  return data
}

export const actionAdminPermissionsEdit = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.roles.create')
  const { t } = await getServerTranslations()

  const action = form.get('action')?.toString() ?? ''
  if (action === 'create') {
    const name = form.get('name')?.toString() ?? ''
    const description = form.get('description')?.toString() ?? ''
    const type: 'admin' | 'app' = form.get('type')?.toString() === 'admin' ? 'admin' : 'app'
    const roles = form.getAll('roles[]').map((f) => f.toString())
    if (roles.length === 0) {
      return { error: 'At least one role is required.' }
    }

    const existing = await db.permission.getByName(name)
    if (existing) {
      return { error: 'Existing permission with name: ' + name }
    }

    const order = (await db.permission.getMaxOrder(type)) + 1
    const data = {
      order,
      name,
      description,
      type,
      is_default: false,
    }
    const permissionId = await db.permission.create(data)
    await setPermissionRoles(permissionId, roles)
  } else {
    return { error: t('shared.invalidForm') }
  }
  return redirect('/admin/accounts/roles-and-permissions/permissions')
}

export default async function (props: IServerComponentsProps) {
  const data = await loader(props)
  return <Component data={data} />
}
