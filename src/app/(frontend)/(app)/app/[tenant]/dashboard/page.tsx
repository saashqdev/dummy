import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { defaultSiteTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import Component from "./component";

export type AppDashboardLoaderData = {
  title: string;
  overviewItems: {
    title: string;
    description: string;
  }[];
  latestItems: {
    column1: string;
    column2: string;
    column3: string;
  }[];
};

const loader = async ({}: IServerComponentsProps) => {
  await requireAuth();
  let { t } = await getServerTranslations();
  const data: AppDashboardLoaderData = {
    title: `${t("app.sidebar.dashboard")} | ${defaultSiteTags.title}`,
    overviewItems: [
      {
        title: "Total Revenue",
        description: "$45,231.89",
      },
      {
        title: "Subscriptions",
        description: "+2350",
      },
      {
        title: "Sales",
        description: "+12,234",
      },
      {
        title: "Active Now",
        description: "+573",
      },
    ],
    latestItems: [
      {
        column1: "Item 1",
        column2: "Item 2",
        column3: "Item 3",
      },
      {
        column1: "Item 1",
        column2: "Item 2",
        column3: "Item 3",
      },
      {
        column1: "Item 1",
        column2: "Item 2",
        column3: "Item 3",
      },
    ],
  };
  return data;
};

export default async function (props: IServerComponentsProps) {
  const data = await loader(props);
  return <Component data={data} />;
}
