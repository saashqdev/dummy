import payload from 'payload'
import { AppConfigurationModel } from '@/db/models'
import { app_configuration } from '@/db/schema'
import { IAppConfigurationDb } from '@/db/interfaces/core/IAppConfigurationDb'
import { createId } from '@paralleldrive/cuid2'

export class AppConfigurationDbDrizzle implements IAppConfigurationDb {
  async get(): Promise<AppConfigurationModel | null> {
    const item = await payload.db.tables.app_configuration.findFirst()
    return item || null
  }
  async create(data: AppConfigurationModel): Promise<void> {
    await payload.db.tables.insert(app_configuration).values({
      id: createId(),
      updated_at: new Date(),
      name: data.name,
      theme: data.theme,
      auth_require_email_verification: data.auth_require_email_verification,
      auth_require_organization: data.auth_require_organization,
      auth_require_name: data.auth_require_name,
      analytics_simple_analytics: data.analytics_simple_analytics,
      analytics_plausible_analytics: data.analytics_plausible_analytics,
      analytics_google_analytics_tracking_id: data.analytics_google_analytics_tracking_id,
      subscription_required: data.subscription_required,
      subscription_allow_subscribe_before_sign_up: data.subscription_allow_subscribe_before_sign_up,
      subscription_allow_sign_up_before_subscribe: data.subscription_allow_sign_up_before_subscribe,
      branding_logo: data.branding_logo,
      branding_logo_dark_mode: data.branding_logo_dark_mode,
      branding_icon: data.branding_icon,
      branding_icon_dark_mode: data.branding_icon_dark_mode,
      branding_favicon: data.branding_favicon,
      head_scripts: data.head_scripts,
      body_scripts: data.body_scripts,
    })
  }
  async update(data: Partial<AppConfigurationModel>): Promise<void> {
    await payload.db.tables.app_configuration.update().set({
      updated_at: new Date(),
      ...data,
    })
  }
  async deleteAll(): Promise<void> {
    await payload.db.tables.app_configuration.deleteMany().execute()
  }
}
