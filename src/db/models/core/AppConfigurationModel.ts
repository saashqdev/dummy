export type AppConfigurationModel = {
  name: string
  theme: string | null
  auth_require_email_verification: boolean
  auth_require_organization: boolean
  auth_require_name: boolean
  analytics_simple_analytics: boolean
  analytics_plausible_analytics: boolean
  analytics_google_analytics_tracking_id: string | null
  subscription_required: boolean
  subscription_allow_subscribe_before_sign_up: boolean
  subscription_allow_sign_up_before_subscribe: boolean
  branding_logo: string | null
  branding_logo_dark_mode: string | null
  branding_icon: string | null
  branding_icon_dark_mode: string | null
  branding_favicon: string | null
  head_scripts: string | null
  body_scripts: string | null
}
