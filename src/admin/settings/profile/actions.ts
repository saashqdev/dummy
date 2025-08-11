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
    firstName: string | undefined
    lastName: string | undefined
  }
  fields?: {
    action: string
    firstName: string | undefined
    lastName: string | undefined
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

  const firstName = form.get('firstName')?.toString()
  const lastName = form.get('lastName')?.toString()
  const avatar = form.get('avatar')?.toString()

  const passwordCurrent = form.get('passwordCurrent')?.toString()
  const passwordNew = form.get('passwordNew')?.toString()
  const passwordNewConfirm = form.get('passwordNewConfirm')?.toString()

  if (typeof action !== 'string') {
    return { profileError: `Form not submitted correctly.` }
  }

  const user = await getUser(userInfo.userId!)
  if (!user) {
    return { profileError: t('shared.notFound') }
  }

  switch (action) {
    case 'profile': {
      const fields = {
        action,
        firstName,
        lastName,
        avatar,
        passwordCurrent,
        passwordNew,
        passwordNewConfirm,
      }
      const fieldErrors = {
        firstName:
          action === 'profile' && (fields.firstName ?? '').length < 2 ? 'First name required' : '',
        lastName:
          action === 'profile' && (fields.lastName ?? '').length < 2 ? 'Last name required' : '',
      }
      if (Object.values(fieldErrors).some(Boolean)) {
        return { fieldErrors, fields }
      }

      if (typeof firstName !== 'string' || typeof lastName !== 'string') {
        return { profileError: `Form not submitted correctly.` }
      }

      if (user?.admin && user.id !== userInfo?.userId) {
        return { profileError: `Cannot update admin user.` }
      }

      const avatarStored = avatar
        ? await storeSupabaseFile({ bucket: 'users-icons', content: avatar, id: userInfo.userId! })
        : avatar
      await updateUser(userInfo.userId!, { firstName, lastName, avatar: avatarStored })
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

      if (user.admin && user.id !== userInfo?.userId) {
        return { passwordError: `Cannot change an admin password` }
      }

      const existingPasswordHash = await db.user.getPasswordHash(user.id)
      const isCorrectPassword = await bcrypt.compare(passwordCurrent, existingPasswordHash ?? '')
      if (!isCorrectPassword) {
        return { passwordError: `Invalid password.` }
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10)
      await updateUser(userInfo.userId!, { passwordHash, verify_token: '' })

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
