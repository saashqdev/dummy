'use server'

import { db } from '@/db'
import { RoleModel, RoleWithPermissionsDto } from '@/db/models'
import { getServerTranslations } from '@/i18n/server'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import Component from './component'
import { createUser } from '@/modules/accounts/services/UserService'
import { setUserRoles } from '@/modules/permissions/services/RolesService'
import { redirect } from 'next/navigation'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('shared.add')} | ${t('models.user.plural')} | ${defaultSiteTags.title}`,
  })
}

export type AdminUsersNewLoaderData = {
  adminRoles: RoleWithPermissionsDto[]
}
export const loader = async () => {
  await verifyUserHasPermission('admin.accounts.create')
  const data: AdminUsersNewLoaderData = {
    adminRoles: await db.role.getAll('admin'),
  }
  return data
}

export const actionAdminUsersNew = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.users.view')
  const { t } = await getServerTranslations()
  const action = form.get('action')?.toString()

  if (action === 'new-user') {
    await verifyUserHasPermission('admin.accounts.create')
    const email = form.get('email')?.toString()
    const firstName = form.get('firstName')?.toString()
    const lastName = form.get('lastName')?.toString()
    const password = form.get('password')?.toString()

    const arrRoles: { id: string; tenantId: string | undefined }[] = form
      .getAll('roles[]')
      .map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString())
      })

    if (!email || !password || !firstName) {
      return { error: 'Missing required fields.' }
    }
    // if (arrRoles.length === 0) {
    //   return ({ error: "You must select at least one role." });
    // }

    const existingUser = await db.user.getByEmail(email)
    if (existingUser) {
      return { error: 'User already exists with that email.' }
    }

    const allRoles = await db.role.getAllInIds(arrRoles.map((r) => r.id))
    const setRoles: { role: RoleModel; tenantId: string | null }[] = []
    arrRoles.forEach(({ id, tenantId }) => {
      const role = allRoles.find((r) => r.id === id)
      if (!role) {
        throw new Error('Role not found with ID: ' + id)
      }
      setRoles.push({ role, tenantId: tenantId ?? null })
    })

    const isAdmin = setRoles.some((r) => r.role.type === 'admin')

    const { id } = await createUser({
      email,
      firstName,
      lastName,
      password,
      default_tenant_id: null,
    })
    const user = await db.user.get(id)
    if (!user) {
      return { error: 'Unexpected error while creating user.' }
    }

    await setUserRoles({ user, roles: setRoles, isAdmin, type: 'admin' })
  } else {
    return { error: t('shared.invalidForm') }
  }
  return redirect('/admin/accounts/users')
}

export default async function () {
  const data = await loader()
  return <Component data={data} />
}
