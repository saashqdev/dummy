'use server'

import { db } from '@/db'
import { getServerTranslations } from '@/i18n/server'
import { requireAuth } from '@/lib/services/loaders.middleware'
import { getUserInfo } from '@/lib/services/session.server'
import { deleteUserWithItsTenants } from '@/modules/accounts/services/TenantService'
import { getUser, updateUser } from '@/modules/accounts/services/UserService'
import { storeSupabaseFile } from '@/modules/storage/SupabaseStorageService'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

type ActionData = {
  profileSuccess?: string
  profileError?: string
  passwordSuccess?: string
  passwordError?: string
  deleteError?: string
  fieldErrors?: {
    first_name: string | undefined
    last_name: string | undefined
  }
  fields?: {
    action: string
    first_name: string | undefined
    last_name: string | undefined
    avatar: string | undefined
    passwordCurrent: string | undefined
    passwordNew: string | undefined
    passwordNewConfirm: string | undefined
  }
}

export const actionAdminProfile = async (prev: any, form: FormData): Promise<ActionData> => {
  await requireAuth({})
  const { t } = await getServerTranslations()

  const userInfo = await getUserInfo()
  const action = form.get('action')

  const first_name = form.get('first_name')?.toString()
  const last_name = form.get('last_name')?.toString()
  const avatar = form.get('avatar')?.toString()

  const passwordCurrent = form.get('passwordCurrent')?.toString()
  const passwordNew = form.get('passwordNew')?.toString()
  const passwordNewConfirm = form.get('passwordNewConfirm')?.toString()

  if (typeof action !== 'string') {
    return { profileError: `Form not submitted correctly.` }
  }

  const user = await getUser(userInfo.user_id!)
  if (!user) {
    return { profileError: t('shared.notFound') }
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
        last_name:
          action === 'profile' && (fields.last_name ?? '').length < 2 ? 'Last name required' : '',
      }
      if (Object.values(fieldErrors).some(Boolean)) {
        return { fieldErrors, fields }
      }

      if (typeof first_name !== 'string' || typeof last_name !== 'string') {
        return { profileError: `Form not submitted correctly.` }
      }

      if (user?.admin && user.id !== userInfo?.user_id) {
        return { profileError: `Cannot update admin user.` }
      }

      const avatarStored = avatar
        ? await storeSupabaseFile({ bucket: 'users-icons', content: avatar, id: userInfo.user_id! })
        : avatar
      await updateUser(userInfo.user_id!, { first_name, last_name, avatar: avatarStored })
      revalidatePath('/admin/settings/profile')
      return { profileSuccess: 'Profile updated' }
    }
    case 'password': {
      if (
        typeof passwordCurrent !== 'string' ||
        typeof passwordNew !== 'string' ||
        typeof passwordNewConfirm !== 'string'
      ) {
        return { passwordError: `Form not submitted correctly.` }
      }

      if (passwordNew !== passwordNewConfirm) {
        return { passwordError: t('account.shared.passwordMismatch') }
      }

      if (passwordNew.length < 6) {
        return { passwordError: `Passwords must have least 6 characters.` }
      }

      if (user.admin && user.id !== userInfo?.user_id) {
        return { passwordError: `Cannot change an admin password` }
      }

      const existingPasswordHash = await db.user.getPasswordHash(user.id)
      const isCorrectPassword = await bcrypt.compare(passwordCurrent, existingPasswordHash ?? '')
      if (!isCorrectPassword) {
        return { passwordError: `Invalid password.` }
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10)
      await updateUser(userInfo.user_id!, { passwordHash, verify_token: '' })

      return {
        passwordSuccess: 'Password updated',
      }
    }
    case 'deleteAccount': {
      if (user.admin) {
        return { deleteError: 'Cannot delete an admin' }
      }

      try {
        await deleteUserWithItsTenants(user.id)
      } catch (e: any) {
        return { deleteError: e }
      }

      // return redirect("/login");
    }
  }
  return {
    profileError: 'Invalid action',
  }
}
