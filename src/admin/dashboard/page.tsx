import { getServerTranslations } from "@/i18n/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import PeriodHelper from "@/lib/helpers/PeriodHelper";
import { getAdminDashboardStats, StatDto } from "@/lib/services/adminDashboardService";
import { TenantWithDetailsDto } from "@/db/models";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { getCurrentPagination } from "@/lib/helpers/PaginationHelper";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import Component from "./component";
import { db } from "@/db";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("app.sidebar.dashboard")} | ${defaultSiteTags.title}`,
  });
}

export type AdminLoaderData = {
  title: string;
  stats: StatDto[];
  tenants: {
    items: TenantWithDetailsDto[];
    pagination: PaginationDto;
  };
};

async function load(props: IServerComponentsProps): Promise<AdminLoaderData> {
  const searchParams = await props.searchParams;
  await requireAuth();
  const currentPagination = getCurrentPagination(searchParams);

  const { t } = await getServerTranslations();

  const data: AdminLoaderData = {
    title: `${t("app.sidebar.dashboard")} | ${defaultSiteTags.title}`,
    stats: await getAdminDashboardStats({ gte: PeriodHelper.getGreaterThanOrEqualsFromRequest() }),
    tenants: await db.tenant.getAllWithPagination({ pagination: currentPagination }),
  };
  return data;
}

export default async function (props: IServerComponentsProps) {
  const data = await load(props);

  return <Component data={data} />;
}
