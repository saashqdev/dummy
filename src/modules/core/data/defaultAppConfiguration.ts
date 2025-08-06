import { defaultThemeColor, defaultThemeScheme } from "@/lib/themes";
import { AppConfigurationDto } from "../dtos/AppConfigurationDto";

export const defaultAppConfiguration: AppConfigurationDto = {
  app: {
    name: "Next.js RockStack Demo",
    orm: "drizzle",
    cache: undefined,
  },
  email: {
    provider: "postmark",
    fromEmail: "alex@rockstack.dev",
    fromName: "Alex @ Rockstack",
    supportEmail: "rockstack.dev@gmail.com",
  },
  theme: {
    color: defaultThemeColor,
    scheme: defaultThemeScheme,
  },
  auth: {
    requireEmailVerification: false,
    requireOrganization: true,
    requireName: true,
  },
  analytics: {
    googleAnalyticsTrackingId: "",
    simpleAnalytics: true,
    plausibleAnalytics: false,
  },
  subscription: {
    required: false,
    allowSubscribeBeforeSignUp: true,
    allowSignUpBeforeSubscribe: true,
  },
  branding: {
    logo: undefined,
    logoDarkMode: undefined,
    icon: undefined,
    iconDarkMode: undefined,
    favicon: undefined,
  },
  affiliates: undefined,
  launches: {
    producthunt: {
      url: "https://www.producthunt.com/posts/rockstack?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-rockstack",
      title: "RockStack",
      postId: "491901",
      end: new Date("2024-10-10"),
      theme: "light",
    },
  },
  scripts: { head: null, body: null },
};
