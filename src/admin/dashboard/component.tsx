"use client";

import { DashboardStats } from "@/components/app/DashboardStats";
import ProfileBanner from "@/components/app/ProfileBanner";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputSelect from "@/components/ui/input/InputSelect";
import { defaultPeriodFilter, PeriodFilters } from "@/lib/helpers/PeriodHelper";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import useAdminData from "@/lib/state/useAdminData";
import TenantsTable from "@/modules/accounts/components/tenants/TenantsTable";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AdminLoaderData } from "./page";

export default function ({ data }: { data: AdminLoaderData }) {
  const { t } = useTranslation();
  const adminData = useAdminData();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  return (
    <main className="relative z-0 flex-1 pb-8">
      {/*Page header */}
      <div className="hidden bg-white shadow md:block lg:border-t lg:border-gray-200">
        <ProfileBanner user={adminData.user} />
      </div>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-5 sm:px-8">
        {getUserHasPermission(adminData, "admin.dashboard.view") ? (
          <div className="space-y-5 overflow-hidden">
            <div className="space-y-3 truncate">
              <div className="flex items-center justify-between space-x-2 p-1">
                <h3 className="flex-grow font-medium leading-4 text-gray-900">{t("app.dashboard.summary")}</h3>
                <div>
                  <InputSelect
                    className="w-44"
                    name="period"
                    value={searchParams.get("period")?.toString() ?? defaultPeriodFilter}
                    options={PeriodFilters.map((f) => {
                      return {
                        value: f.value,
                        name: t(f.name),
                      };
                    })}
                    onChange={(value) => {
                      const params = new URLSearchParams(searchParams);
                      if (!value || value === defaultPeriodFilter) {
                        params.delete("period");
                      } else if (value) {
                        params.set("period", value?.toString() ?? "");
                      }
                      replace(`${pathname}?${params.toString()}`);
                      // setSearchParams(searchParams);
                    }}
                  />
                </div>
              </div>
              <DashboardStats items={data.stats} />
            </div>

            <div className="space-y-4 overflow-x-auto p-1">
              <div className="flex items-center justify-between space-x-2">
                <h3 className="font-medium leading-4 text-gray-900">{t("models.tenant.plural")}</h3>
                <ButtonSecondary to="/admin/accounts">{t("shared.viewAll")}</ButtonSecondary>
              </div>
              <TenantsTable items={data.tenants.items} pagination={data.tenants.pagination} />
            </div>
          </div>
        ) : (
          <div className="font-medium">{"You don't have permission to view the dashboard."}</div>
        )}
      </div>
    </main>
  );
}
