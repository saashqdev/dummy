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
import { TenantUserWithUserDto } from '@/db/models'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import UrlUtils from '@/lib/utils/UrlUtils'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('settings.members.actions.new')} | ${defaultSiteTags.title}`,
  })
}

export type AppSettingsMembersEditLoaderData = {
  member: TenantUserWithUserDto
}

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params
  const { t } = await getServerTranslations()
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.members.update', tenantId)

  const member = await db.tenantUser.getById(params?.id!)
  if (!member) {
    return redirect(`/app/${tenantSlug}/settings/members`)
  }
  const data: AppSettingsMembersEditLoaderData = {
    member,
  }
  return data
}

type ActionData = {
  error?: string
  success?: string
  fields?: {
    email: string
    first_name: string
    last_name: string
    role: number
  }
}

export const actionAppSettingsMembersEdit = async (prev: any, form: FormData) => {
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

export default async function (props: IServerComponentsProps) {
  const data = await loader(props)
  return <Component data={data} />
}
