import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import Component from './component'
import { db } from '@/db'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import defaultPlans from '@/modules/subscriptions/data/defaultPlans.server'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('admin.pricing.title')} | ${defaultSiteTags.title}`,
  })
}

export type PricingLoaderData = {
  isStripeTest: boolean
  items: SubscriptionProductDto[]
}
const loader = async () => {
  if (!process.env.STRIPE_SK) {
    throw new Error('Stripe is not configured: STRIPE_SK is not set.')
  }
  await verifyUserHasPermission('admin.pricing.view')
  const data: PricingLoaderData = {
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith('sk_test_') ?? true,
    items: await db.subscription_product.getAllSubscriptionProductsWithTenants(),
  }

  if (data.items.length === 0) {
    data.items = defaultPlans
  }

  return data
}

export default async function () {
  const data = await loader()
  return <Component data={data} />
}
