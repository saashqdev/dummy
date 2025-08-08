'use server'

import { getTenantIdFromUrl } from '@/modules/accounts/services/TenantService'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { PermissionModel, TenantUserInvitationModel } from '@/db/models'
import { getUser } from '@/modules/accounts/services/UserService'
import { createUserRole, deleteUserRole } from '@/modules/permissions/services/UserRolesService'
import { getUserInfo } from '@/lib/services/session.server'
import { AppRoleEnum } from '@/modules/permissions/enums/AppRoleEnum'
import { RoleWithPermissionsDto, TenantUserWithUserDto } from '@/db/models'
import { getBaseURL } from '@/lib/services/url.server'
import { db } from '@/db'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import { requireTenantSlug } from '@/lib/services/url.server'
import { requireAuth } from '@/lib/services/loaders.middleware'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import Component from './component'
import { revalidatePath } from 'next/cache'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('settings.members.title')} | ${defaultSiteTags.title}`,
  })
}

export type AppSettingsMembersLoaderData = {
  users: TenantUserWithUserDto[]
  pendingInvitations: TenantUserInvitationModel[]
  roles: RoleWithPermissionsDto[]
  permissions: PermissionModel[]
  appUrl: string
}

const loader = async () => {
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.members.view', tenantId)

  const users = await db.tenantUser.getAll(tenantId)
  const pendingInvitations = await db.tenantUserInvitation.getPending(tenantId)

  const roles = await db.role.getAll('app')
  const permissions = await db.permission.getAll({ type: 'app' })

  const data: AppSettingsMembersLoaderData = {
    users,
    pendingInvitations,
    roles,
    permissions,
    appUrl: await getBaseURL(),
  }
  return data
}

type ActionData = {
  success?: string
  error?: string
}
export const actionAppSettingsMembersLayout = async (prev: any, form: FormData) => {
  await requireAuth()
  const { t } = await getServerTranslations()
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  const userInfo = await getUserInfo()
  const action = form.get('action')?.toString()
  const fromUser = await getUser(userInfo.userId!)
  if (!fromUser) {
    return { error: 'Invalid user' }
  }

  if (action === 'delete-invitation') {
    const invitationId = form.get('invitation-id')?.toString() ?? ''
    const invitation = await db.tenantUserInvitation.get(invitationId)
    if (!invitation) {
      return { error: 'Invitation not found' }
    }
    await db.tenantUserInvitation.del(invitation.id)
    revalidatePath(`/app/${tenantSlug}/settings/members`)
    return { success: 'Invitation deleted' }
  }
  if (action === 'edit') {
    const user_id = form.get('user-id')?.toString() ?? ''
    const roleId = form.get('role-id')?.toString() ?? ''
    const add = form.get('add') === 'true'

    const role = await db.role.get(roleId)

    if (role?.name === AppRoleEnum.SuperUser) {
      const allMembers = await db.tenantUser.getAll(tenantId)
      const superAdmins = allMembers.filter((m) =>
        m.user.roles.some((r) => r.tenant_id === tenantId && r.role.name === AppRoleEnum.SuperUser),
      )
      if (superAdmins.length === 1 && !add) {
        return { error: 'There must be at least one super user' }
      }
      if (user_id === userInfo.userId) {
        return { error: 'You cannot remove yourself from the super user role' }
      }
    }
    if (add) {
      await createUserRole({ userId: user_id, roleId, tenantId })
    } else {
      await deleteUserRole({ userId: user_id, roleId, tenantId })
    }
    revalidatePath(`/app/${tenantSlug}/settings/members`)
    return { success: t('shared.updated') }
  } else {
    return { error: t('shared.invalidForm') }
  }
}

export default async function ({ children }: IServerComponentsProps) {
  const data = await loader()
  return <Component data={data}>{children}</Component>
}
