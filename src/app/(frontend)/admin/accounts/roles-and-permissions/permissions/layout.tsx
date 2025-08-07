"use server";

import { FilterablePropertyDto } from "@/lib/dtos/FilterablePropertyDto";
import { getStringFilter } from "@/lib/helpers/PaginationHelper";
import { PermissionWithRolesDto } from "@/db/models";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";
import { revalidatePath } from "next/cache";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.permission.plural")} | ${defaultSiteTags.title}`,
  });
}

export type AdminPermissionsLoaderData = {
  items: PermissionWithRolesDto[];
  filterableProperties: FilterablePropertyDto[];
};

const loader = async (props: IServerComponentsProps) => {
  const searchParams = await props.searchParams;
  await verifyUserHasPermission("admin.roles.view");
  let { t } = await getServerTranslations();

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "roleId",
      title: t("models.role.object"),
      manual: true,
      options: (await db.role.getAllNames()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  const filters = {
    roleId: getStringFilter(searchParams, "roleId"),
  };
  const items = await db.permission.getAll(filters);

  const data: AdminPermissionsLoaderData = {
    items,
    filterableProperties,
  };
  return data;
};

export const actionAdminPermissions = async (prev: any, form: FormData) => {
  await verifyUserHasPermission("admin.roles.update");
  const { t } = await getServerTranslations();
  const action = form.get("action")?.toString();

  if (action === "set-orders") {
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await db.permission.update(id, { order: Number(order) });
      })
    );
    revalidatePath("/admin/accounts/roles-and-permissions/permissions");
    return { items: await db.permission.getAll() };
  } else {
    return { error: t("shared.invalidForm") };
  }
};

export default async function ({ searchParams, children }: IServerComponentsProps) {
  const data = await loader({ searchParams });
  return <Component data={data}>{children}</Component>;
}
