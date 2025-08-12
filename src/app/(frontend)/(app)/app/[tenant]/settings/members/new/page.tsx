'use server'

import { getTenantIdFromUrl } from '@/modules/accounts/services/TenantService'
import { PlanFeatureUsageDto } from '@/modules/subscriptions/dtos/PlanFeatureUsageDto'
import { getPlanFeatureUsage } from '@/modules/subscriptions/services/SubscriptionService'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { DefaultAppFeatures } from '@/modules/subscriptions/data/appFeatures'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import { requireTenantSlug } from '@/lib/services/url.server'
import Component from './component'

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

export default async function () {
  const data = await loader()
  return <Component data={data} />
}
