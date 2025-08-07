"use server";

import { TenantWithDetailsDto } from "@/db/models";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.permission.userRoles")} | ${defaultSiteTags.title}`,
  });
}

export type AdminAccountUsersLoaderData = {
  tenants: TenantWithDetailsDto[];
};

const loader = async () => {
  await verifyUserHasPermission("admin.roles.update");
  const tenants = await db.tenant.getAll();

  const data: AdminAccountUsersLoaderData = {
    tenants,
  };
  return data;
};

export default async function () {
  const data = await loader();
  return <Component data={data} />;
}
