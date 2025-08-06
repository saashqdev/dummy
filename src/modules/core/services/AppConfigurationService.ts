import { db } from "@/db";
import { AppConfigurationDto } from "../dtos/AppConfigurationDto";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { defaultThemeColor } from "@/lib/themes";
import { AppConfigurationModel } from "@/db/models";
import { defaultAppConfiguration } from "../data/defaultAppConfiguration";

export async function getAppConfiguration(): Promise<AppConfigurationDto> {
  const appConfiguration = await cachified({
    key: `appConfiguration`,
    ttl: 1000 * 60 * 60 * 24, // 1 day
    getFreshValue: async () => db.appConfiguration.get(),
  });

  if (!appConfiguration) {
    return defaultAppConfiguration;
  }

  const conf = structuredClone(defaultAppConfiguration);
  conf.app.name = appConfiguration?.name ?? "";
  conf.theme.color = appConfiguration?.theme || defaultThemeColor;
  conf.auth.requireEmailVerification = appConfiguration?.authRequireEmailVerification;
  conf.auth.requireOrganization = appConfiguration?.authRequireOrganization;
  conf.auth.requireName = appConfiguration?.authRequireName;
  conf.analytics.simpleAnalytics = appConfiguration?.analyticsSimpleAnalytics;
  conf.analytics.plausibleAnalytics = appConfiguration?.analyticsPlausibleAnalytics;
  conf.analytics.googleAnalyticsTrackingId = appConfiguration?.analyticsGoogleAnalyticsTrackingId ?? undefined;
  conf.subscription.required = appConfiguration?.subscriptionRequired;
  conf.subscription.allowSubscribeBeforeSignUp = appConfiguration?.subscriptionAllowSubscribeBeforeSignUp;
  conf.subscription.allowSignUpBeforeSubscribe = appConfiguration?.subscriptionAllowSignUpBeforeSubscribe;
  conf.branding.logo = appConfiguration?.brandingLogo ?? undefined;
  conf.branding.logoDarkMode = appConfiguration?.brandingLogoDarkMode ?? undefined;
  conf.branding.icon = appConfiguration?.brandingIcon ?? undefined;
  conf.branding.iconDarkMode = appConfiguration?.brandingIconDarkMode ?? undefined;
  conf.branding.favicon = appConfiguration?.brandingFavicon ?? undefined;
  conf.scripts = {
    head: appConfiguration?.headScripts || null,
    body: appConfiguration?.bodyScripts || null,
  };

  return conf;
}

async function getOrCreateAppConfiguration() {
  let settings = await db.appConfiguration.get();

  if (!settings) {
    const conf = await getAppConfiguration();
    await db.appConfiguration
      .create({
        name: conf.app.name,
        theme: conf.theme.color,
        authRequireEmailVerification: conf.auth.requireEmailVerification,
        authRequireOrganization: conf.auth.requireOrganization,
        authRequireName: conf.auth.requireName,
        analyticsSimpleAnalytics: conf.analytics.simpleAnalytics,
        analyticsPlausibleAnalytics: conf.analytics.plausibleAnalytics,
        analyticsGoogleAnalyticsTrackingId: conf.analytics.googleAnalyticsTrackingId || null,
        subscriptionRequired: conf.subscription.required,
        subscriptionAllowSubscribeBeforeSignUp: conf.subscription.allowSubscribeBeforeSignUp,
        subscriptionAllowSignUpBeforeSubscribe: conf.subscription.allowSignUpBeforeSubscribe,
        brandingLogo: conf.branding.logo || null,
        brandingLogoDarkMode: conf.branding.logoDarkMode || null,
        brandingIcon: conf.branding.icon || null,
        brandingIconDarkMode: conf.branding.iconDarkMode || null,
        brandingFavicon: conf.branding.favicon || null,
        headScripts: conf.scripts.head || null,
        bodyScripts: conf.scripts.body || null,
      })
      .then((item) => {
        clearCacheKey(`appConfiguration`);
        return item;
      });
  }

  return getAppConfiguration();
}

export async function getAppName() {
  const appConfiguration = await getAppConfiguration();
  return appConfiguration.app.name;
}

export async function updateAppConfiguration(data: Partial<AppConfigurationModel>) {
  await getOrCreateAppConfiguration();
  return await db.appConfiguration.update(data).then((item) => {
    clearCacheKey(`appConfiguration`);
    return item;
  });
}

export async function deleteAppConfiguration() {
  return await db.appConfiguration.deleteAll().then((item) => {
    clearCacheKey(`appConfiguration`);
    return item;
  });
}
