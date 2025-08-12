'use server'

import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import Component from './component'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.tenant.object')} | ${defaultSiteTags.title}`,
  })
}

export default async function ({}: IServerComponentsProps) {
  return <Component />
}
