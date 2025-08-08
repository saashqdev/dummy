'use server'

import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { getCurrentUrl } from '@/lib/services/url.server'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import {
  CheckoutSessionResponse,
  getAcquiredItemsFromCheckoutSession,
} from '@/modules/subscriptions/services/PricingService'
import { persistCheckoutSessionStatus } from '@/modules/subscriptions/services/SubscriptionService'
import Component from './component'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('account.register.setup')} | ${defaultSiteTags.title}`,
  })
}

export type PricingSessionSuccessLoaderData = {
  error?: string
  checkoutSession?: CheckoutSessionResponse
}
const loader = async (props: IServerComponentsProps): Promise<PricingSessionSuccessLoaderData> => {
  const params = await props.params
  const { t } = await getServerTranslations()

  await persistCheckoutSessionStatus({
    id: params?.session ?? '',
    fromUrl: await getCurrentUrl(),
  })
  const checkoutSession = await getAcquiredItemsFromCheckoutSession(params?.session ?? '')

  if (!checkoutSession) {
    return { error: t('settings.subscription.checkout.invalid') }
  } else if (!checkoutSession.status?.pending) {
    return { error: t('settings.subscription.checkout.alreadyProcessed') }
  }

  return {
    checkoutSession,
  }
}

export default async function ({ params }: IServerComponentsProps) {
  const { t } = await getServerTranslations()
  const data = await loader({ params })

  return <Component data={data} />
}
