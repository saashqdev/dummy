import { db } from '@/db'
import { AppConfigurationDto } from '../dtos/AppConfigurationDto'
import { cachified, clearCacheKey } from '@/lib/services/cache.server'
import { defaultThemeColor } from '@/lib/themes'
import { AppConfigurationModel } from '@/db/models'
import { defaultAppConfiguration } from '../data/defaultAppConfiguration'

export async function getAppConfiguration(): Promise<AppConfigurationDto> {
  const appConfiguration = await cachified({
    key: `appConfiguration`,
    ttl: 1000 * 60 * 60 * 24, // 1 day
    getFreshValue: async () => db.appConfiguration.get(),
  })

  if (!appConfiguration) {
    return defaultAppConfiguration
  }

  const conf = structuredClone(defaultAppConfiguration)
  conf.app.name = appConfiguration?.name ?? ''
  conf.theme.color = appConfiguration?.theme || defaultThemeColor
  conf.auth.require_email_verification = appConfiguration?.auth_require_email_verification
  conf.auth.require_organization = appConfiguration?.auth_require_organization
  conf.auth.require_name = appConfiguration?.auth_require_name
  conf.analytics.simple_analytics = appConfiguration?.analytics_simple_analytics
  conf.analytics.plausible_analytics = appConfiguration?.analytics_plausible_analytics
  conf.analytics.google_analytics_tracking_id =
    appConfiguration?.analytics_google_analytics_tracking_id ?? undefined
  conf.subscription.required = appConfiguration?.subscription_required
  conf.subscription.allow_subscribe_before_sign_up =
    appConfiguration?.subscription_allow_subscribe_before_sign_up
  conf.subscription.allow_sign_up_before_subscribe =
    appConfiguration?.subscription_allow_sign_up_before_subscribe
  conf.branding.logo = appConfiguration?.branding_logo ?? undefined
  conf.branding.logo_dark_mode = appConfiguration?.branding_logo_dark_mode ?? undefined
  conf.branding.icon = appConfiguration?.branding_icon ?? undefined
  conf.branding.icon_dark_mode = appConfiguration?.branding_icon_dark_mode ?? undefined
  conf.branding.favicon = appConfiguration?.branding_favicon ?? undefined
  conf.scripts = {
    head: appConfiguration?.head_scripts || null,
    body: appConfiguration?.body_scripts || null,
  }

  return conf
}

async function getOrCreateAppConfiguration() {
  let settings = await db.appConfiguration.get()

  if (!settings) {
    const conf = await getAppConfiguration()
    await db.appConfiguration
      .create({
        name: conf.app.name,
        theme: conf.theme.color,
        auth_require_email_verification: conf.auth.require_email_verification,
        auth_require_organization: conf.auth.require_organization,
        auth_require_name: conf.auth.require_name,
        analytics_simple_analytics: conf.analytics.simple_analytics,
        analytics_plausible_analytics: conf.analytics.plausible_analytics,
        analytics_google_analytics_tracking_id: conf.analytics.google_analytics_tracking_id || null,
        subscription_required: conf.subscription.required,
        subscription_allow_subscribe_before_sign_up:
          conf.subscription.allow_subscribe_before_sign_up,
        subscription_allow_sign_up_before_subscribe:
          conf.subscription.allow_sign_up_before_subscribe,
        branding_logo: conf.branding.logo || null,
        branding_logo_dark_mode: conf.branding.logo_dark_mode || null,
        branding_icon: conf.branding.icon || null,
        branding_icon_dark_mode: conf.branding.icon_dark_mode || null,
        branding_favicon: conf.branding.favicon || null,
        head_scripts: conf.scripts.head || null,
        body_scripts: conf.scripts.body || null,
      })
      .then((item) => {
        clearCacheKey(`appConfiguration`)
        return item
      })
  }

  return getAppConfiguration()
}

export async function getAppName() {
  const appConfiguration = await getAppConfiguration()
  return appConfiguration.app.name
}

export async function updateAppConfiguration(data: Partial<AppConfigurationModel>) {
  await getOrCreateAppConfiguration()
  return await db.appConfiguration.update(data).then((item) => {
    clearCacheKey(`appConfiguration`)
    return item
  })
}

export async function deleteAppConfiguration() {
  return await db.appConfiguration.deleteAll().then((item) => {
    clearCacheKey(`appConfiguration`)
    return item
  })
}
