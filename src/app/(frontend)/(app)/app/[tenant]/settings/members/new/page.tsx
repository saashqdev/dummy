'use server'

import { getTenant } from '@/modules/accounts/services/TenantService'
import { db } from '@/db'
import { getUser } from '@/modules/accounts/services/UserService'
import { sendEmail } from '@/modules/emails/services/EmailService'
import { getTenantIdFromUrl } from '@/modules/accounts/services/TenantService'
import { PlanFeatureUsageDto } from '@/modules/subscriptions/dtos/PlanFeatureUsageDto'
import { getPlanFeatureUsage } from '@/modules/subscriptions/services/SubscriptionService'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { DefaultAppFeatures } from '@/modules/subscriptions/data/appFeatures'
import { getBaseURL } from '@/lib/services/url.server'
import { getUserInfo } from '@/lib/services/session.server'
import EmailTemplates from '@/modules/emails/utils/EmailTemplates'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import { requireTenantSlug } from '@/lib/services/url.server'
import Component from './component'
import { redirect } from 'next/navigation'
import FormHelper from '@/lib/helpers/FormHelper'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('settings.members.actions.new')} | ${defaultSiteTags.title}`,
  })
}

type LoaderData = {
  featurePlanUsage: PlanFeatureUsageDto | undefined
}

const loader = async () => {
  const { t } = await getServerTranslations()
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.members.create', tenantId)
  const featurePlanUsage = await getPlanFeatureUsage(tenantId, DefaultAppFeatures.Users)
  const data: LoaderData = {
    featurePlanUsage,
  }
  return data
}

export type NewMemberActionData = {
  error?: string
  success?: string
}

export const actionAppSettingsMembersNew = async (prev: any, form: FormData) => {
  const appConfiguration = await getAppConfiguration()
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.members.create', tenantId)
  const { user_id } = await getUserInfo()

  const fromUser = await getUser(user_id!)
  const tenant = await getTenant(tenantId)
  if (!tenant || !fromUser) {
    return { error: 'Could not find tenant or user' }
  }

  const email = form.get('email')?.toString().toLowerCase().trim() ?? ''
  const first_name = form.get('first-name')?.toString() ?? ''
  const last_name = form.get('last-name')?.toString() ?? ''
  const sendInvitationEmail = FormHelper.getBoolean(form, 'send-invitation-email')

  try {
    const user = await db.user.getByEmail(email)
    if (user) {
      const tenantUser = await db.tenantUser.get({ tenantId, userId: user.id })
      if (tenantUser) {
        return { error: 'User already in organization' }
      }
    }

    const invitationId = await db.tenantUserInvitation.create({
      tenantId,
      email,
      first_name,
      last_name,
      fromUserId: fromUser?.id ?? null,
      pending: true,
      createdUserId: null,
    })
    const invitation = await db.tenantUserInvitation.get(invitationId)
    if (!invitation) {
      return { error: 'Could not create invitation' }
    }

    if (sendInvitationEmail) {
      await sendEmail({
        to: email,
        ...EmailTemplates.USER_INVITATION_EMAIL.parse({
          name: first_name,
          invite_sender_name: fromUser.first_name,
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

export default async function () {
  const data = await loader()
  return <Component data={data} />
}
