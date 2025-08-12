'use server'

import { db } from '@/db'
import { UserWithDetailsDto } from '@/db/models'
import { getServerTranslations } from '@/i18n/server'
import { FilterablePropertyDto } from '@/lib/dtos/FilterablePropertyDto'
import { PaginationDto } from '@/lib/dtos/PaginationDto'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import {
  getBooleanFilter,
  getCurrentPagination,
  getNullableStringFilter,
  getStringFilter,
} from '@/lib/helpers/PaginationHelper'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import Component from './component'
import { getUser, updateUser } from '@/modules/accounts/services/UserService'
import bcrypt from 'bcryptjs'
import { deleteUserWithItsTenants } from '@/modules/accounts/services/TenantService'
import { getUserInfo } from '@/lib/services/session.server'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.user.plural')} | ${defaultSiteTags.title}`,
  })
}

export type AdminUsersLoaderData = {
  items: UserWithDetailsDto[]
  filterableProperties: FilterablePropertyDto[]
  pagination: PaginationDto
}

const loader = async (props: IServerComponentsProps) => {
  const searchParams = await props.searchParams
  await verifyUserHasPermission('admin.users.view')
  let { t } = await getServerTranslations()

  const filterableProperties: FilterablePropertyDto[] = [
    { name: 'email', title: t('models.user.email') },
    { name: 'firstName', title: t('models.user.firstName') },
    { name: 'lastName', title: t('models.user.lastName') },
    {
      name: 'tenantId',
      title: t('models.tenant.object'),
      manual: true,
      options: (await db.tenant.getAllIdsAndNames()).map((tenant) => {
        return {
          value: tenant.id,
          name: tenant.name,
        }
      }),
    },
    {
      name: 'isAdmin',
      title: 'Is admin',
      manual: true,
      isBoolean: true,
    },
  ]
  const filters = {
    email: getStringFilter(searchParams, 'email'),
    firstName: getStringFilter(searchParams, 'firstName'),
    lastName: getStringFilter(searchParams, 'lastName'),
    tenantId: getNullableStringFilter(searchParams, 'tenantId'),
    admin: getBooleanFilter(searchParams, 'isAdmin'),
  }
  const currentPagination = getCurrentPagination(searchParams)
  const { items, pagination } = await db.user.getAllWithPagination({
    filters,
    pagination: currentPagination,
  })

  const data: AdminUsersLoaderData = {
    items,
    filterableProperties,
    pagination,
  }
  return data
}

export const actionAdminUsers = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.users.view')
  const userInfo = await getUserInfo()
  const { t } = await getServerTranslations()

  const action = form.get('action')?.toString()
  const user_id = form.get('user-id')?.toString()
  const user = await getUser(user_id)

  if (!user_id || !user || !action) {
    return { error: 'Form not submitted correctly.' }
  }
  switch (action) {
    case 'change-password': {
      await verifyUserHasPermission('admin.users.changePassword')
      const passwordNew = form.get('password-new')?.toString()
      if (!passwordNew || passwordNew.length < 8) {
        return { error: 'Set a password with 8 characters minimum' }
      } else if (user?.admin && user.id !== userInfo.userId) {
        return { error: 'You cannot change password for admin user' }
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10)
      await updateUser(user.id, { passwordHash, verify_token: '' })

      return { success: t('shared.updated') }
    }
    case 'delete-user': {
      await verifyUserHasPermission('admin.users.delete')
      try {
        await deleteUserWithItsTenants(user_id)
      } catch (e: any) {
        return { error: e }
      }
      return { success: t('shared.deleted') }
    }
    default: {
      return { error: 'Form not submitted correctly.' }
    }
  }
}

export default async function (
  { searchParams }: IServerComponentsProps,
  { children }: { children: React.ReactNode },
) {
  const data = await loader({ searchParams })
  return <Component data={data}>{children}</Component>
}
