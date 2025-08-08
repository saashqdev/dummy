'use server'

import { db } from '@/db'
import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { getUserInfo } from '@/lib/services/session.server'
import {
  deleteUserWithItsTenants,
  getTenant,
  getTenantIdFromUrl,
} from '@/modules/accounts/services/TenantService'
import { getUser, updateUser } from '@/modules/accounts/services/UserService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { storeSupabaseFile } from '@/modules/storage/SupabaseStorageService'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import Component from './component'
import { revalidatePath } from 'next/cache'
import { requireTenantSlug } from '@/lib/services/url.server'
import { requireAuth } from '@/lib/services/loaders.middleware'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('settings.profile.profileTitle')} | ${defaultSiteTags.title}`,
  })
}

export const actionAppSettingsProfile = async (prev: any, form: FormData) => {
  await requireAuth()
  const userInfo = await getUserInfo()
  if (!userInfo?.userId) {
    throw Error('Unauthorized')
  }
  const { t } = await getServerTranslations()
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  const action = form.get('action')

  const first_name = form.get('first_name')?.toString()
  const last_name = form.get('last_name')?.toString() ?? ''
  const avatar = form.get('avatar')?.toString() ?? ''

  const passwordCurrent = form.get('passwordCurrent')?.toString()
  const passwordNew = form.get('passwordNew')?.toString()
  const passwordNewConfirm = form.get('passwordNewConfirm')?.toString()

  if (typeof action !== 'string') {
    return { error: `Form not submitted correctly.` }
  }

  const user = await getUser(userInfo.userId!)
  const tenant = await getTenant(tenantId)
  if (!user) {
    return { error: `User not found.` }
  }
  if (!tenant) {
    return { error: `Account not found.` }
  }
  switch (action) {
    case 'profile': {
      const fields = {
        action,
        first_name,
        last_name,
        avatar,
        passwordCurrent,
        passwordNew,
        passwordNewConfirm,
      }
      const fieldErrors = {
        first_name:
          action === 'profile' && (fields.first_name ?? '').length < 2 ? 'First name required' : '',
        // last_name: action === "profile" && (fields.last_name ?? "").length < 2 ? "Last name required" : "",
      }
      if (Object.values(fieldErrors).some(Boolean)) {
        return { error: `Form not submitted correctly.`, fields: fieldErrors }
      }

      if (typeof first_name !== 'string' || typeof last_name !== 'string') {
        return { error: `Form not submitted correctly.` }
      }

      let avatarStored = avatar
        ? await storeSupabaseFile({ bucket: 'users-icons', content: avatar, id: userInfo.userId! })
        : avatar
      await updateUser(userInfo.userId!, { first_name, last_name, avatar: avatarStored })
      revalidatePath(`/app/${tenantSlug}/settings/profile`)
      return { success: t('shared.updated') }
    }
    case 'password': {
      if (
        typeof passwordCurrent !== 'string' ||
        typeof passwordNew !== 'string' ||
        typeof passwordNewConfirm !== 'string'
      ) {
        return { error: `Form not submitted correctly.` }
      }

      if (passwordNew !== passwordNewConfirm) {
        return { error: t('account.shared.passwordMismatch') }
      }

      if (passwordNew.length < 6) {
        return {
          error: `Passwords must have least 6 characters.`,
        }
      }

      if (!user) {
        return null
      }

      const existingPasswordHash = await db.user.getPasswordHash(user.id)
      const isCorrectPassword = await bcrypt.compare(passwordCurrent, existingPasswordHash ?? '')
      if (!isCorrectPassword) {
        return { error: `Invalid password.` }
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10)
      await updateUser(userInfo.userId, { passwordHash, verify_token: '' })

      revalidatePath(`/app/${tenantSlug}/settings/profile`)
      return { success: t('shared.updated') }
    }
    case 'deleteAccount': {
      if (!user) {
        return null
      }
      if (user.admin) {
        return { error: 'Cannot delete an admin' }
      }

      try {
        await deleteUserWithItsTenants(user.id)
      } catch (e: any) {
        return { error: e.message }
      }

      revalidatePath(`/app/${tenantSlug}/settings/profile`)
      return redirect('/login')
    }
  }
}

export default async function ({}: IServerComponentsProps) {
  return <Component />
}
