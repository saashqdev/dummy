'server-only'

import { getUserInfo } from '@/lib/services/session.server'
import { getUser } from '@/modules/accounts/services/UserService'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { defaultSiteTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getBaseURL, getDomainName } from '@/lib/services/url.server'
import i18next from 'i18next'
import { RootDataDto } from '../state/useRootData'

export async function getRootData(): Promise<RootDataDto> {
  const userInfo = await getUserInfo()
  const user = userInfo.userId ? await getUser(userInfo.userId) : null
  const appConfiguration = await getAppConfiguration()

  return {
    metatags: {
      title: `${defaultSiteTags.title}`,
    },
    user,
    theme: {
      color: userInfo.theme || appConfiguration.theme.color,
      scheme: userInfo.scheme || appConfiguration.theme.scheme,
    },
    locale: i18next.language || 'en',
    serverUrl: await getBaseURL(),
    domainName: await getDomainName(),
    userSession: userInfo,
    authenticated: !!userInfo.userId,
    debug: process.env.NODE_ENV === 'development',
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith('sk_test_') ?? true,
    chatWebsiteId: process.env.CRISP_CHAT_WEBSITE_ID?.toString(),
    appConfiguration,
  }
}
