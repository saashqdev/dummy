'use server'

import { getServerTranslations } from '@/i18n/server'
import { defaultAppConfiguration } from '@/modules/core/data/defaultAppConfiguration'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import Component from './component'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('affiliates.program')} | ${defaultSiteTags.title}`,
    description: t('affiliates.description'),
  })
}

export type AffiliateProgramLoaderData = {
  enabled?: boolean
  contactEmail?: string
  affiliates: {
    percentage: number
    plans: { title: string; price: number }[]
    signUpLink: string
  }
}
export let loader = async () => {
  const { t } = await getServerTranslations()
  const appConfiguration = await getAppConfiguration()
  let affiliatesConfig = appConfiguration.affiliates
  if (!affiliatesConfig) {
    throw Error(t('shared.notFound'))
  }
  if (!affiliatesConfig?.provider.rewardfulApiKey) {
    throw Error('[Affiliates] Rewardful API key is not set.')
  } else if (!affiliatesConfig?.percentage) {
    throw Error('[Affiliates] Percentage is not set.')
  } else if (!affiliatesConfig?.plans || affiliatesConfig.plans.length === 0) {
    throw Error('[Affiliates] Plans are not set.')
  } else if (!affiliatesConfig?.signUpLink) {
    throw Error('[Affiliates] SignUp link is not set.')
  }
  const data: AffiliateProgramLoaderData = {
    enabled: true,
    contactEmail: defaultAppConfiguration.email.support_email,
    affiliates: {
      percentage: affiliatesConfig.percentage,
      plans: affiliatesConfig.plans,
      signUpLink: affiliatesConfig.signUpLink,
    },
  }
  return data
}

export default async function () {
  const data = await loader()
  return <Component data={data} />
}
