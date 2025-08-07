import Logo from '@/components/brand/Logo'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { getServerTranslations } from '@/i18n/server'
import InfoBanner from '@/components/ui/banners/InfoBanner'
import LoginForm from '@/modules/accounts/components/auth/LoginForm'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { getUserInfo } from '@/lib/services/session.server'
import { getUser } from '@/modules/accounts/services/UserService'
import { redirect } from 'next/navigation'
import { getTenant } from '@/modules/accounts/services/TenantService'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('account.login.title')} | ${defaultSiteTags.title}`,
  })
}

const loader = async () => {
  const userInfo = await getUserInfo()
  if (userInfo.user_id) {
    const user = await getUser(userInfo.user_id)
    if (user) {
      if (!user?.default_tenant_id) {
        return redirect('/app')
      } else {
        const tenant = await getTenant(user.default_tenant_id)
        if (tenant) {
          return redirect(`/app/${tenant?.slug ?? tenant.id}`)
        }
      }
    }
  }

  const demoUser = process.env.DEMO_USER?.split(':')
  const demoCredentials =
    demoUser && demoUser.length > 1 ? { email: demoUser[0], password: demoUser[1] } : undefined
  return {
    appConfiguration: await getAppConfiguration(),
    demoCredentials,
  }
}
export default async function () {
  const data = await loader()

  return (
    <div>
      <div className="">
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-sm space-y-5">
            <Logo className="mx-auto h-9" />

            <LoginForm appConfiguration={data.appConfiguration} />

            {data.demoCredentials && (
              <InfoBanner title="Guest Demo Account" text="">
                <b>email:</b>
                <span className="select-all">{data.demoCredentials.email}</span>, <b>password:</b>
                <span className="select-all">{data.demoCredentials.password}</span>.
              </InfoBanner>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
