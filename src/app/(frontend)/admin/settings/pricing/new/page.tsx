import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("admin.pricing.new")} | ${defaultSiteTags.title}`,
  });
}

const loader = async () => {
  await verifyUserHasPermission("admin.pricing.create");
  const items = await db.subscriptionProduct.getAllSubscriptionProducts();
  return { plans: items };
};

export default async function () {
  const data = await loader();
  return <Component plans={data.plans} />;
}
