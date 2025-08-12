'use server'

import { getServerTranslations } from '@/i18n/server'
import { getUserInfo } from '@/lib/services/session.server'
import { getUser } from '@/modules/accounts/services/UserService'
import { defaultSiteTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { redirect } from 'next/navigation'
import Component from './component'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return {
    title: `${t('pricing.subscribe')} | ${defaultSiteTags.title}`,
  }
}

export default async function () {
  const userInfo = await getUserInfo()
  const user = userInfo.userId ? await getUser(userInfo.userId) : null
  if (!user) {
    throw redirect(`/login`)
  }
  return <Component />
}
