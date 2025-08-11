import { getServerTranslations } from "@/i18n/server";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("settings.profile.profileTitle")} | ${defaultSiteTags.title}`,
  });
}

export default async function () {
  return <Component />;
}
