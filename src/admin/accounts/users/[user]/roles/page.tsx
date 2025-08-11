'use server'

import { db } from '@/db'
import { RoleModel, RoleWithPermissionsDto, UserWithDetailsDto } from '@/db/models'
import { getServerTranslations } from '@/i18n/server'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import Component from './component'
import { setUserRoles } from '@/modules/permissions/services/RolesService'
import { redirect } from 'next/navigation'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { getUserInfo } from '@/lib/services/session.server'
import { AdminRoleEnum } from '@/modules/permissions/enums/AdminRoleEnum'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.role.plural')} | ${t('models.user.plural')} | ${defaultSiteTags.title}`,
  })
}

export type AdminUsersEditRolesLoaderData = {
  user: UserWithDetailsDto
  adminRoles: RoleWithPermissionsDto[]
}
const loader = async (props: IServerComponentsProps) => {
  const params = await props.params
  await verifyUserHasPermission('admin.roles.set')
  const user = await db.user.getByEmailWithDetails(decodeURIComponent(params?.user!))
  if (!user) {
    return redirect('/admin/accounts/users')
  }
  const data: AdminUsersEditRolesLoaderData = {
    user,
    adminRoles: await db.role.getAll('admin'),
  }
  return data
}

export const actionAdminUsersEditRoles = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.roles.set')
  const userInfo = await getUserInfo()

  const userEmail = form.get('userEmail')?.toString()
  if (!userEmail) {
    return { error: 'Invalid user ID' }
  }

  const action = form.get('action')?.toString()
  const user = await db.user.getByEmail(userEmail)

  if (!user) {
    return redirect('/admin/accounts/users')
  }

  if (action === 'set-user-roles') {
    const arrRoles: { id: string; tenantId: string | undefined }[] = form
      .getAll('roles[]')
      .map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString())
      })
    const allRoles = await db.role.getAllInIds(arrRoles.map((r) => r.id))
    let setRoles: { role: RoleModel; tenantId: string | null }[] = []
    arrRoles.forEach(({ id, tenantId }) => {
      const role = allRoles.find((r) => r.id === id)
      if (!role) {
        throw new Error('Role not found with ID: ' + id)
      }
      setRoles.push({ role, tenantId: tenantId ?? null })
    })
    setRoles = setRoles.filter((v, i, a) => a.findIndex((t) => t.role.id === v.role.id) === i)

    const isAdmin = setRoles.some((r) => r.role.type === 'admin')
    // eslint-disable-next-line no-console
    console.log(
      'setting roles for user',
      JSON.stringify({
        user: user.email,
        roles: setRoles.map((f) => f.role.name),
        isAdmin,
      }),
    )
    const adminUsers = (await db.user.getAll()).filter((f) => f.admin)
    if (!isAdmin && adminUsers.length === 1) {
      return { error: 'You cannot remove admin access from the last admin user' }
    }
    const hasSuperAdmin = setRoles.some((r) => r.role.name === AdminRoleEnum.SuperAdmin)
    if (user.id === userInfo.userId && !hasSuperAdmin) {
      return { error: 'You cannot remove super admin access from yourself' }
    }

    await setUserRoles({ user, roles: setRoles, isAdmin, type: 'admin' })

    return redirect('/admin/accounts/users')
    // return ({ success: t("shared.updated") });
  } else {
    return { error: 'Form not submitted correctly.' }
  }
}

export default async function (props: IServerComponentsProps) {
  const data = await loader(props)
  return <Component data={data} />
}
