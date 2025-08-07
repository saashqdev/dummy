import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import Component from "./component";
import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("admin.pricing.edit")} | ${defaultSiteTags.title}`,
  });
}

async function load(props: IServerComponentsProps) {
  const params = await props.params;
  await verifyUserHasPermission("admin.pricing.view");

  const item = await db.subscriptionProduct.getSubscriptionProduct(params?.id ?? "");
  if (!item) {
    return redirect("/admin/settings/pricing");
  }

  return {
    item,
    plans: await db.subscriptionProduct.getAllSubscriptionProducts(),
  };
}

export default async function ({ params }: IServerComponentsProps) {
  const data = await load({ params });
  return <Component item={data.item} plans={data.plans} />;
}
