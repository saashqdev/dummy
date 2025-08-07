"use server";

import { PermissionWithRolesDto, RoleWithPermissionsDto } from "@/db/models";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";
import { redirect } from "next/navigation";
import { deletePermission, setPermissionRoles, updatePermission } from "@/modules/permissions/services/PermissionsService";

export async function generateMetadata(props: IServerComponentsProps) {
  const params = await props.params;
  const { t } = await getServerTranslations();
  const item = await db.permission.get(params?.id ?? "");
  return getMetaTags({
    title: `${item?.name} | ${t("models.permission.object")} | ${defaultSiteTags.title}`,
  });
}

export type AdminPermissionsEditLoaderData = {
  item: PermissionWithRolesDto;
  roles: RoleWithPermissionsDto[];
};

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params;
  await verifyUserHasPermission("admin.roles.update");

  const item = await db.permission.get(params?.id ?? "");
  if (!item) {
    throw redirect("/admin/accounts/roles-and-permissions/permissions");
  }
  const roles = await db.role.getAll();
  const data: AdminPermissionsEditLoaderData = {
    item,
    roles,
  };
  return data;
};

export const actionAdminPermissionsEdit = async (prev: any, form: FormData) => {
  const id = form.get("id")?.toString() ?? "";
  await verifyUserHasPermission("admin.roles.update");
  const { t } = await getServerTranslations();

  const existing = await db.permission.get(id);
  if (!existing) {
    return redirect("/admin/accounts/roles-and-permissions/permissions");
  }

  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    const name = form.get("name")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const type: "admin" | "app" = form.get("type")?.toString() === "admin" ? "admin" : "app";
    const roles = form.getAll("roles[]").map((f) => f.toString());
    if (roles.length === 0) {
      return { error: "At least one role is required." };
    }
    const data = {
      name,
      description,
      type,
    };
    await updatePermission(existing.id, data);
    await setPermissionRoles(existing.id, roles);
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.roles.delete");
    await deletePermission(existing.id);
  } else {
    return { error: t("shared.invalidForm") };
  }
  return redirect("/admin/accounts/roles-and-permissions/permissions");
};

export default async function (props: IServerComponentsProps) {
  const data = await loader(props);
  return <Component data={data} />;
}
