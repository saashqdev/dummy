import { getServerTranslations } from "@/i18n/server";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("settings.admin.analytics.title")} | ${defaultSiteTags.title}`,
  });
}

export default async function () {
  await verifyUserHasPermission("admin.settings.analytics.view");
  return <Component />;
}
