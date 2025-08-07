export type AppConfigurationDto = {
  app: {
    name: string
    orm: 'drizzle'
    cache: 'redis' | undefined
  }
  email: {
    provider: 'postmark' | 'resend'
    from_name: string
    from_email: string
    support_email: string
  }
  theme: { color: string; scheme: 'light' | 'dark' }
  auth: {
    require_email_verification: boolean
    require_organization: boolean
    require_name: boolean
  }
  analytics: {
    simple_analytics: boolean
    plausible_analytics: boolean
    google_analytics_tracking_id?: string
  }
  subscription: {
    required: boolean
    allow_subscribe_before_sign_up: boolean
    allow_sign_up_before_subscribe: boolean
  }
  branding: {
    logo?: string
    logo_dark_mode?: string
    icon?: string
    icon_dark_mode?: string
    favicon?: string
  }
  affiliates?: {
    provider: { rewardfulApiKey: string }
    signUpLink: string
    percentage: number
    plans: { title: string; price: number }[]
  }
  launches?: {
    producthunt?: {
      title: string
      url: string
      postId: string
      start?: Date
      end?: Date
      theme?: 'light' | 'neutral' | 'dark'
    }
  }
  // portals: PortalConfiguration;
  scripts: { head: string | null; body: string | null }
}
