"use server";

import { db } from "@/db";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import Component from "./component";
import { CreatePermissionDto, CreateRoleDto, defaultAdminRoles, defaultAppRoles, defaultPermissions } from "@/modules/permissions/data/DefaultRoles";
import SeedService from "@/modules/core/services/SeedService";
import { revalidatePath } from "next/cache";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.role.adminRoles")} | ${defaultSiteTags.title}`,
  });
}

export type AdminRolesSeedLoaderData = {
  title: string;
  roles: {
    all: CreateRoleDto[];
    missing: CreateRoleDto[];
  };
  permissions: {
    all: CreatePermissionDto[];
    missing: CreatePermissionDto[];
  };
};

const loader = async () => {
  await verifyUserHasPermission("admin.roles.view");
  const roles: { all: CreateRoleDto[]; missing: CreateRoleDto[] } = {
    all: [...defaultAppRoles, ...defaultAdminRoles],
    missing: [],
  };
  const createdRoles = await db.role.getAllNames();
  roles.all.forEach((role) => {
    const existing = createdRoles.find((r) => r.name === role.name);
    if (!existing) {
      roles.missing.push(role);
    }
  });

  const permissions: { all: CreatePermissionDto[]; missing: CreatePermissionDto[] } = {
    all: defaultPermissions,
    missing: [],
  };
  const createdPermissions = await db.permission.getAllIdsAndNames();
  permissions.all.forEach((permission) => {
    const existing = createdPermissions.find((r) => r.name === permission.name);
    if (!existing) {
      permissions.missing.push(permission);
    }
  });
  const data: AdminRolesSeedLoaderData = {
    title: `Seed | ${defaultSiteTags.title}`,
    roles,
    permissions,
  };
  return data;
};

export const actionAdminRolesSeed = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations();
  const action = form.get("action");
  if (action === "seed") {
    try {
      await SeedService.seedRolesAndPermissions();
      revalidatePath("/admin/accounts/roles-and-permissions/seed");
      return { success: "Roles and permissions seeded successfully" };
    } catch (e: any) {
      return { error: e.message };
    }
  } else {
    return { error: t("shared.invalidForm") };
  }
};

export default async function () {
  const data = await loader();
  return <Component data={data} />;
}
