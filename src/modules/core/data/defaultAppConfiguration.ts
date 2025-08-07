import { defaultThemeColor, defaultThemeScheme } from '@/lib/themes'
import { AppConfigurationDto } from '../dtos/AppConfigurationDto'

export const defaultAppConfiguration: AppConfigurationDto = {
  app: {
    name: 'Payload inTake Demo',
    orm: 'drizzle',
    cache: undefined,
  },
  email: {
    provider: 'postmark',
    from_email: 'support@gointake.ca',
    from_name: 'Dave @ inTake',
    support_email: 'saashqdev@gmail.com',
  },
  theme: {
    color: defaultThemeColor,
    scheme: defaultThemeScheme,
  },
  auth: {
    require_email_verification: false,
    require_organization: true,
    require_name: true,
  },
  analytics: {
    google_analytics_tracking_id: '',
    simple_analytics: true,
    plausible_analytics: false,
  },
  subscription: {
    required: false,
    allow_subscribe_before_sign_up: true,
    allow_sign_up_before_subscribe: true,
  },
  branding: {
    logo: undefined,
    logo_dark_mode: undefined,
    icon: undefined,
    icon_dark_mode: undefined,
    favicon: undefined,
  },
  affiliates: undefined,
  launches: {
    producthunt: {
      url: 'https://www.producthunt.com/posts/intake',
      title: 'inTake',
      postId: '491901',
      end: new Date('2024-10-10'),
      theme: 'light',
    },
  },
  scripts: { head: null, body: null },
}
