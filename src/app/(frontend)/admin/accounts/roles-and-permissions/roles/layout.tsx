"use server";

import { FilterablePropertyDto } from "@/lib/dtos/FilterablePropertyDto";
import { getStringFilter } from "@/lib/helpers/PaginationHelper";
import { RoleWithPermissionsAndUsersDto } from "@/db/models";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.role.plural")} | ${defaultSiteTags.title}`,
  });
}

export type AdminRolesLoaderData = {
  items: RoleWithPermissionsAndUsersDto[];
  filterableProperties: FilterablePropertyDto[];
};

const loader = async (props: IServerComponentsProps) => {
  const searchParams = await props.searchParams;
  await verifyUserHasPermission("admin.roles.view");
  let { t } = await getServerTranslations();

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "name", title: t("models.role.name") },
    { name: "description", title: t("models.role.description") },
    {
      name: "permissionId",
      title: t("models.permission.object"),
      manual: true,
      options: (await db.permission.getAllIdsAndNames()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  const filters = {
    name: getStringFilter(searchParams, "name"),
    description: getStringFilter(searchParams, "description"),
    permissionId: getStringFilter(searchParams, "permissionId"),
  };
  const items = await db.role.getAllWithUsers(filters);

  const data: AdminRolesLoaderData = {
    items,
    filterableProperties,
  };
  return data;
};

export default async function ({ searchParams, children }: IServerComponentsProps) {
  const data = await loader({ searchParams });
  return <Component data={data}>{children}</Component>;
}
