'use server'

import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { TenantUserInvitationWithTenantDto, UserDto } from '@/db/models'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import Component from './component'
import { db } from '@/db'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { createUserSession, getUserInfo } from '@/lib/services/session.server'
import AuthUtils from '@/modules/accounts/utils/AuthUtils'
import { createUser, getDefaultTenant } from '@/modules/accounts/services/UserService'
import { addTenantUser } from '@/modules/accounts/services/TenantService'
import { sendEmail } from '@/modules/emails/services/EmailService'
import EmailTemplates from '@/modules/emails/utils/EmailTemplates'
import { getBaseURL } from '@/lib/services/url.server'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('account.invitation.title')} | ${defaultSiteTags.title}`,
  })
}

export type InvitationLoaderData = {
  invitation: TenantUserInvitationWithTenantDto | null
  existingUser: UserDto | null
}
const loader = async (props: IServerComponentsProps) => {
  const params = await props.params
  const { t } = await getServerTranslations()

  const invitation = await db.tenantUserInvitation.get(params?.id ?? '')
  if (!invitation || !invitation.pending) {
    throw new Error(t('shared.notFound'))
  }
  const existingUser = await db.user.getByEmail(invitation.email)
  const data: InvitationLoaderData = {
    invitation,
    existingUser,
  }
  return data
}

export const actionInvitation = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations()
  const appConfiguration = await getAppConfiguration()
  const userInfo = await getUserInfo()
  const invitationId = form.get('invitationId')?.toString()
  const password = form.get('password')?.toString() ?? ''
  const passwordConfirm = form.get('password-confirm')?.toString() ?? ''

  const invitation = await db.tenantUserInvitation.get(invitationId ?? '')
  if (!invitation || !invitation.pending) {
    return { error: 'Invalid invitation' }
  }
  let existingUser = await db.user.getByEmail(invitation.email)
  if (!existingUser) {
    // Register user
    const passwordError = AuthUtils.validatePasswords({ t, password, passwordConfirm })
    if (passwordError) {
      return { error: passwordError }
    }

    const user = await createUser({
      email: invitation.email,
      first_name: invitation.first_name,
      last_name: invitation.last_name,
      password,
    })
    if (!user) {
      return { error: 'Could not create user' }
    }
    await db.tenantUserInvitation.update(invitation.id, {
      pending: false,
    })
    await addTenantUser({
      tenantId: invitation.tenantId,
      userId: user.id,
    })

    await sendEmail({
      to: invitation.email,
      ...EmailTemplates.WELCOME_EMAIL.parse({
        name: invitation.first_name,
        appConfiguration,
        action_url: (await getBaseURL()) + `/login`,
      }),
    })

    const defaultTenant = await getDefaultTenant(user)
    return await createUserSession(
      {
        ...userInfo,
        userId: user.id,
      },
      defaultTenant ? `/app/${defaultTenant.slug}/dashboard` : '/app',
    )
  } else {
    // Existing user
    await db.tenantUserInvitation.update(invitation.id, {
      pending: false,
    })
    await addTenantUser({
      tenantId: invitation.tenantId,
      userId: existingUser.id,
    })

    const defaultTenant = await getDefaultTenant(existingUser)
    return await createUserSession(
      {
        ...userInfo,
        userId: existingUser.id,
      },
      defaultTenant ? `/app/${defaultTenant.slug}/dashboard` : '/app',
    )
  }
}

export default async function (props: IServerComponentsProps) {
  const data = await loader(props)
  return <Component data={data} />
}
