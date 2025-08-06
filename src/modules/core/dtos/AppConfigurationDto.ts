export type AppConfigurationDto = {
  app: {
    name: string;
    orm: "drizzle" | "mock";
    cache: "redis" | undefined;
  };
  email: {
    provider: "postmark" | "resend";
    fromName: string;
    fromEmail: string;
    supportEmail: string;
  };
  theme: { color: string; scheme: "light" | "dark" };
  auth: {
    requireEmailVerification: boolean;
    requireOrganization: boolean;
    requireName: boolean;
  };
  analytics: {
    simpleAnalytics: boolean;
    plausibleAnalytics: boolean;
    googleAnalyticsTrackingId?: string;
  };
  subscription: {
    required: boolean;
    allowSubscribeBeforeSignUp: boolean;
    allowSignUpBeforeSubscribe: boolean;
  };
  branding: {
    logo?: string;
    logoDarkMode?: string;
    icon?: string;
    iconDarkMode?: string;
    favicon?: string;
  };
  affiliates?: {
    provider: { rewardfulApiKey: string };
    signUpLink: string;
    percentage: number;
    plans: { title: string; price: number }[];
  };
  launches?: {
    producthunt?: { title: string; url: string; postId: string; start?: Date; end?: Date; theme?: "light" | "neutral" | "dark" };
  };
  // portals: PortalConfiguration;
  scripts: { head: string | null; body: string | null };
};
