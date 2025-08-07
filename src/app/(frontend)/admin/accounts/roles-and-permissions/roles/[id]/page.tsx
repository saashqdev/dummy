"use server";

import { FilterablePropertyDto } from "@/lib/dtos/FilterablePropertyDto";
import { getStringFilter } from "@/lib/helpers/PaginationHelper";
import { PermissionWithRolesDto, RoleWithPermissionsAndUsersDto, RoleWithPermissionsDto } from "@/db/models";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";
import { redirect } from "next/navigation";
import { deleteRole, updateRole } from "@/modules/permissions/services/RolesService";
import { setRolePermissions } from "@/modules/permissions/services/PermissionsService";

export async function generateMetadata(props: IServerComponentsProps) {
  const params = await props.params;
  const { t } = await getServerTranslations();
  const item = await db.role.get(params?.id ?? "");
  return getMetaTags({
    title: `${item?.name} | ${t("models.role.object")} | ${defaultSiteTags.title}`,
  });
}

export type AdminRolesEditLoaderData = {
  item: RoleWithPermissionsDto;
  permissions: PermissionWithRolesDto[];
};

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params;
  await verifyUserHasPermission("admin.roles.update");

  const item = await db.role.get(params?.id ?? "");
  if (!item) {
    throw redirect("/admin/accounts/roles-and-permissions/roles");
  }
  const permissions = await db.permission.getAll();
  const data: AdminRolesEditLoaderData = {
    item,
    permissions,
  };
  return data;
};

export const actionAdminRolesEdit = async (prev: any, form: FormData) => {
  const id = form.get("id")?.toString() ?? "";
  if (!id) {
    return { error: "Invalid role ID" };
  }
  await verifyUserHasPermission("admin.roles.update");
  const { t } = await getServerTranslations();

  const existing = await db.role.get(id);
  if (!existing) {
    return redirect("/admin/accounts/roles-and-permissions/roles");
  }

  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    await verifyUserHasPermission("admin.roles.update");
    const name = form.get("name")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const assignToNewUsers = Boolean(form.get("assign-to-new-users"));
    const type: "admin" | "app" = form.get("type")?.toString() === "admin" ? "admin" : "app";
    const permissions = form.getAll("permissions[]").map((f) => f.toString());
    if (permissions.length === 0) {
      return { error: "At least one permission is required." };
    }
    const data = {
      name,
      description,
      assignToNewUsers,
      type,
    };
    await updateRole(existing.id, data);
    await setRolePermissions(existing.id, permissions);
    return redirect("/admin/accounts/roles-and-permissions/roles");
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.roles.delete");
    await deleteRole(existing.id);
    return redirect("/admin/accounts/roles-and-permissions/roles");
  } else {
    return { error: t("shared.invalidForm") };
  }
};

export default async function (props: IServerComponentsProps) {
  const data = await loader(props);
  return <Component data={data} />;
}
