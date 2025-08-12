import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import IndexPageLayout from '@/components/ui/layouts/IndexPageLayout'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.role.plural')} | ${defaultSiteTags.title}`,
  })
}

export default async function ({ children }: { children: React.ReactNode }) {
  await verifyUserHasPermission('admin.roles.view')
  const { t } = await getServerTranslations()
  return (
    <IndexPageLayout
      title={''}
      tabs={[
        {
          name: t('models.role.plural'),
          routePath: '/admin/accounts/roles-and-permissions/roles',
        },
        {
          name: t('models.permission.plural'),
          routePath: '/admin/accounts/roles-and-permissions/permissions',
        },
        {
          name: t('models.role.adminRoles'),
          routePath: '/admin/accounts/roles-and-permissions/admin-users',
        },
        {
          name: t('models.role.userRoles'),
          routePath: '/admin/accounts/roles-and-permissions/account-users',
        },
        {
          name: 'Seed',
          routePath: '/admin/accounts/roles-and-permissions/seed',
        },
      ]}
    >
      {children}
    </IndexPageLayout>
  )
}
