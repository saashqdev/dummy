import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import { SubscriptionProductDto } from "@/modules/subscriptions/dtos/SubscriptionProductDto";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `Pricing Features | ${defaultSiteTags.title}`,
  });
}

export type PricingFeaturesLoaderData = {
  items: SubscriptionProductDto[];
};
async function load(props: IServerComponentsProps) {
  const searchParams = await props.searchParams;
  await verifyUserHasPermission("admin.pricing.view");
  const ids: string[] = [];
  if (searchParams?.ids) {
    if (Array.isArray(searchParams.ids)) {
      ids.push(...searchParams.ids);
    } else {
      ids.push(searchParams.ids);
    }
  }
  const items: SubscriptionProductDto[] =
    ids.length > 0 ? await db.subscriptionProduct.getSubscriptionProductsInIds(ids) : await db.subscriptionProduct.getAllSubscriptionProductsWithTenants();
  return { items };
}

export default async function (props: IServerComponentsProps) {
  const data = await load(props);
  return <Component data={data} />;
}
