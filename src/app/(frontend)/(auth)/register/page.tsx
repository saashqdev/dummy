import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { getAppConfiguration } from "@/modules/core/services/AppConfigurationService";
import { redirect } from "next/navigation";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("account.register.title")} | ${defaultSiteTags.title}`,
  });
}

export default async function () {
  const appConfiguration = await getAppConfiguration();
  if (!appConfiguration.subscription.allowSignUpBeforeSubscribe) {
    return redirect("/pricing");
  }

  return <Component />;
}
