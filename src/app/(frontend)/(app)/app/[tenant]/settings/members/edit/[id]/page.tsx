'use server'

import { db } from '@/db'
import { getTenantIdFromUrl } from '@/modules/accounts/services/TenantService'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import { requireTenantSlug } from '@/lib/services/url.server'
import Component from './component'
import { redirect } from 'next/navigation'
import { TenantUserWithUserDto } from '@/db/models'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'

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
    firstName: string
    lastName: string
    role: number
  }
}

export default async function (props: IServerComponentsProps) {
  const data = await loader(props)
  return <Component data={data} />
}
