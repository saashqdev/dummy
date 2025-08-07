"use client";

import useAppData from "@/lib/state/useAppData";
import { AppDashboardLoaderData } from "./page";
import ProfileBanner from "@/components/app/ProfileBanner";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TableSimple from "@/components/ui/tables/TableSimple";

export default function ({ data }: { data: AppDashboardLoaderData }) {
  const appData = useAppData();

  return (
    <main className="relative z-0 h-screen flex-1 pb-8">
      <div className="hidden bg-white shadow md:block lg:border-t lg:border-gray-200">
        <ProfileBanner user={appData.user} />
      </div>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-5 sm:px-8">
        {getUserHasPermission(appData, "app.dashboard.view") ? (
          <div className="space-y-6">
            <DashboardOverview items={data.overviewItems} />
            <DashboardLatestActivity items={data.latestItems} />
          </div>
        ) : (
          <div className="font-medium">{"You don't have permission to view the dashboard."}</div>
        )}
      </div>
    </main>
  );
}

function DashboardOverview({
  items,
}: {
  items: {
    title: string;
    description: string;
  }[];
}) {
  const { t } = useTranslation();
  return (
    <div className="w-full space-y-3">
      <h3 className="flex-grow font-medium leading-4">{t("shared.overview")}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{item.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DashboardLatestActivity({ items }: { items: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between space-x-2">
        <h3 className="flex-grow font-medium leading-4">{t("shared.latestActivity")}</h3>
      </div>
      <TableSimple
        items={items}
        headers={[
          {
            title: "Column 1",
            value: (item: any) => <div>{item.column1}</div>,
          },
          {
            title: "Column 2",
            value: (item: any) => <div>{item.column2}</div>,
          },
          {
            title: "Column 3",
            value: (item: any) => <div>{item.column3}</div>,
          },
        ]}
      />
    </div>
  );
}
