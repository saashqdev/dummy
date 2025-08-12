'use server'

import {
  deleteAndCancelTenant,
  getTenant,
  getTenantByIdOrSlug,
  getTenantIdFromUrl,
  updateTenant,
} from '@/modules/accounts/services/TenantService'

import { db } from '@/db'
import { storeSupabaseFile } from '@/modules/storage/SupabaseStorageService'
import { redirect } from 'next/navigation'
import { requireTenantSlug } from '@/lib/services/url.server'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { getActiveTenantSubscriptions } from '@/modules/subscriptions/services/SubscriptionService'
import { revalidatePath } from 'next/cache'
import { getServerTranslations } from '@/i18n/server'

import { getUser, updateUser } from '@/modules/accounts/services/UserService'
import { sendEmail } from '@/modules/emails/services/EmailService'
import { getBaseURL } from '@/lib/services/url.server'
import { getUserInfo } from '@/lib/services/session.server'
import EmailTemplates from '@/modules/emails/utils/EmailTemplates'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import FormHelper from '@/lib/helpers/FormHelper'

import { deleteUserWithItsTenants } from '@/modules/accounts/services/TenantService'
import bcrypt from 'bcryptjs'
import { requireAuth } from '@/lib/services/loaders.middleware'

import { cancelTenantSubscriptionProduct } from '@/modules/subscriptions/services/TenantSubscriptionService'
import { stripeService } from '@/modules/subscriptions/services/StripeService'

export const actionAppSettingsAccount = async (form: FormData) => {
  const { t } = await getServerTranslations()
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.account.update', tenantId)

  const action = form.get('action')?.toString() ?? ''

  if (action === 'edit') {
    const name = form.get('name')?.toString() ?? ''
    const slug = form.get('slug')?.toString().toLowerCase() ?? ''
    const icon = form.get('icon')?.toString() ?? ''
    if ((name?.length ?? 0) < 1) {
      return { error: 'Account name must have at least 1 character' }
    }
    if (!slug || slug.length < 1) {
      return { error: 'Account slug must have at least 1 character' }
    }

    if (['settings'].includes(slug.toLowerCase())) {
      return { error: 'Slug cannot be ' + slug }
    }
    if (slug.includes(' ')) {
      return { error: 'Slug cannot contain white spaces' }
    }

    const existing = await getTenant(tenantId)
    if (!existing) {
      return { error: 'Tenant not found' }
    }

    if (existing?.slug !== slug) {
      const existingSlug = await getTenantByIdOrSlug(slug)
      if (existingSlug) {
        return { error: 'Slug already taken' }
      }
      let iconStored = icon
        ? await storeSupabaseFile({ bucket: 'accounts-icons', content: icon, id: tenantId })
        : icon
      await updateTenant(existing, { name, icon: iconStored, slug })
      return redirect(`/app/${encodeURIComponent(slug)}/settings/account`)
    } else {
      let iconStored = icon
        ? await storeSupabaseFile({ bucket: 'accounts-icons', content: icon, id: tenantId })
        : icon
      await updateTenant(existing, { name, icon: iconStored, slug })
      revalidatePath(`/app/${tenantSlug}/settings/account`)
      return { success: t('settings.tenant.updated') }
    }
  } else if (action === 'delete') {
    await verifyUserHasPermission('app.settings.account.delete', tenantId)
    const activeSubscriptions = await getActiveTenantSubscriptions(tenantId)
    if (activeSubscriptions && activeSubscriptions.products.find((f) => !f.cancelled_at)) {
      return { error: 'You cannot delete a tenant with active subscriptions' }
    }
    await deleteAndCancelTenant(tenantId)
    return redirect('/app')
  } else {
    return { error: t('shared.invalidForm') }
  }
}

export const actionAppSettingsMembersEdit = async (form: FormData) => {
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.members.update', tenantId)
  const { t } = await getServerTranslations()

  const id = form.get('id')?.toString()
  if (!id) {
    return { error: t('shared.notFound') }
  }
  const action = form.get('action')?.toString()

  if (action === 'edit') {
    const tenantUser = await db.tenantUser.getById(id)
    if (!tenantUser) {
      return { error: t('shared.notFound') }
    }

    return redirect(`/app/${tenantSlug}/settings/members`)
  } else if (action === 'delete') {
    await verifyUserHasPermission('app.settings.members.delete', tenantId)
    try {
      await db.tenantUser.del(id)
    } catch (e: any) {
      return { error: e.toString() }
    }
    return redirect(`/app/${tenantSlug}/settings/members`)
  }
}

export const actionAppSettingsMembersNew = async (prev: any, form: FormData) => {
  const appConfiguration = await getAppConfiguration()
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.members.create', tenantId)
  const { userId } = await getUserInfo()

  const fromUser = await getUser(userId!)
  const tenant = await getTenant(tenantId)
  if (!tenant || !fromUser) {
    return { error: 'Could not find tenant or user' }
  }

  const email = form.get('email')?.toString().toLowerCase().trim() ?? ''
  const firstName = form.get('first-name')?.toString() ?? ''
  const lastName = form.get('last-name')?.toString() ?? ''
  const sendInvitationEmail = FormHelper.getBoolean(form, 'send-invitation-email')

  try {
    const user = await db.user.getByEmail(email)
    if (user) {
      const tenantUser = await db.tenantUser.get({ tenant_id: tenantId, userId: user.id })
      if (tenantUser) {
        return { error: 'User already in organization' }
      }
    }

    const invitationId = await db.tenantUserInvitation.create({
      tenant_id: tenantId,
      email,
      firstName,
      lastName,
      from_user_id: fromUser?.id ?? null,
      pending: true,
      created_user_id: null,
    })
    const invitation = await db.tenantUserInvitation.get(invitationId)
    if (!invitation) {
      return { error: 'Could not create invitation' }
    }

    if (sendInvitationEmail) {
      await sendEmail({
        to: email,
        ...EmailTemplates.USER_INVITATION_EMAIL.parse({
          name: firstName,
          invite_sender_name: fromUser.firstName,
          invite_sender_organization: tenant.name,
          appConfiguration,
          action_url: (await getBaseURL()) + `/invitation/${invitation.id}`,
        }),
      })
    }
  } catch (e: any) {
    return { error: e.error }
  }
  return redirect(`/app/${tenantSlug}/settings/members`)
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

  const firstName = form.get('firstName')?.toString()
  const lastName = form.get('lastName')?.toString() ?? ''
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
        // lastName: action === "profile" && (fields.lastName ?? "").length < 2 ? "Last name required" : "",
      }
      if (Object.values(fieldErrors).some(Boolean)) {
        return { error: `Form not submitted correctly.`, fields: fieldErrors }
      }

      if (typeof firstName !== 'string' || typeof lastName !== 'string') {
        return { error: `Form not submitted correctly.` }
      }

      let avatarStored = avatar
        ? await storeSupabaseFile({ bucket: 'users-icons', content: avatar, id: userInfo.userId! })
        : avatar
      await updateUser(userInfo.userId!, { firstName, lastName, avatar: avatarStored })
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

export const actionAppSettingsSubscription = async (prev: any, form: FormData) => {
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.subscription.update', tenantId)
  const tenantSubscription = await db.tenantSubscription.get(tenantId)

  const action = form.get('action')?.toString()

  if (!tenantSubscription || !tenantSubscription?.stripe_customer_id) {
    return {
      error: 'Invalid stripe customer: ' + (tenantSubscription?.stripe_customer_id || 'empty'),
    }
  } else if (action === 'cancel') {
    await verifyUserHasPermission('app.settings.subscription.delete', tenantId)
    const tenantSubscriptionProductId = form.get('tenant-subscription-product-id')?.toString() ?? ''
    const tenantSubscriptionProduct = await db.tenantSubscriptionProduct.get(
      tenantSubscriptionProductId,
    )
    if (!tenantSubscriptionProduct?.stripe_subscription_id) {
      return { error: 'Not subscribed' }
    }
    await stripeService.cancelStripeSubscription(tenantSubscriptionProduct?.stripe_subscription_id)
    const stripeSubscription = await stripeService.getStripeSubscription(
      tenantSubscriptionProduct.stripe_subscription_id,
    )
    await cancelTenantSubscriptionProduct(tenantSubscriptionProduct.id, {
      cancelled_at: new Date(),
      ends_at: stripeSubscription?.ended_at
        ? new Date(stripeSubscription.ended_at * 1000)
        : new Date(),
    })
    revalidatePath(`/app/${tenantSlug}/settings/subscription`)
    return {
      success: 'Successfully cancelled',
    }
  } else if (action === 'add-payment-method') {
    const session = await stripeService.createStripeSetupSession(
      tenantSubscription.stripe_customer_id,
    )
    return redirect(session?.url ?? '')
  } else if (action === 'delete-payment-method') {
    await stripeService.deleteStripePaymentMethod(form.get('id')?.toString() ?? '')
    return {}
  } else if (action === 'open-customer-portal') {
    const session = await stripeService.createCustomerPortalSession(
      tenantSubscription.stripe_customer_id,
    )
    return redirect(session?.url ?? '')
  }
}
