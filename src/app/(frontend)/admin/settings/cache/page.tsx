import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import Component from "./component";
import { CachedValue, getCachedValues } from "@/lib/services/cache.server";
import { UserDto } from "@/db/models";
import { db } from "@/db";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("settings.admin.cache.title")} | ${defaultSiteTags.title}`,
  });
}

export type CacheLoaderData = {
  cachedValues: CachedValue[];
  allTenants: { id: string; name: string; slug: string }[];
  allUsers: UserDto[];
};
const loader = async () => {
  await verifyUserHasPermission("admin.settings.general.update");
  const { t } = await getServerTranslations();
  const cachedValues = await getCachedValues();

  const allTenants = await db.tenant.getAllIdsAndNames();
  const allUsers = await db.user.getAll();

  const data: CacheLoaderData = {
    cachedValues,
    allTenants,
    allUsers,
  };
  return data;
};

export default async function () {
  const data = await loader();
  return <Component data={data} />;
}
