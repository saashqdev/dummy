"use server";

import { db } from "@/db";
import { TenantDto } from "@/db/models";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { addTenantUser, createTenant } from "@/modules/accounts/services/TenantService";
import { getUser } from "@/modules/accounts/services/UserService";
import { defaultSiteTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { redirect } from "next/navigation";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return {
    title: `${t("pricing.subscribe")} | ${defaultSiteTags.title}`,
  };
}

export const actionNewAccount = async (prev: any, form: FormData) => {
  const userInfo = await getUserInfo();
  const user = userInfo.userId ? await getUser(userInfo.userId) : null;
  if (!user) {
    throw redirect(`/login`);
  }
  let createdTenant: TenantDto | null = null;
  try {
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString();
    createdTenant = await createTenant({ name, slug, userId: user.id });
    const roles = await db.role.getAll("app");
    await addTenantUser({
      tenantId: createdTenant.id,
      userId: user.id,
      roles,
    });
  } catch (e: any) {
    return { error: e.message };
  }
  return redirect(`/app/${createdTenant.slug}/dashboard`);
};

export default async function () {
  const userInfo = await getUserInfo();
  const user = userInfo.userId ? await getUser(userInfo.userId) : null;
  if (!user) {
    throw redirect(`/login`);
  }
  return <Component />;
}
