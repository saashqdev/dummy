"use client";

import useAdminData from "@/lib/state/useAdminData";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import InputFilters from "@/components/ui/input/InputFilters";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import RolesTable from "@/modules/permissions/components/RolesTable";
import { AdminRolesLoaderData } from "./layout";

export default function ({ data, children }: { data: AdminRolesLoaderData; children: React.ReactNode }) {
  const { t } = useTranslation();
  const adminData = useAdminData();

  return (
    <div className="space-y-2">
      <div className="flex justify-end space-x-2">
        <InputFilters filters={data.filterableProperties} withSearch={false} />
        <ButtonPrimary disabled={!getUserHasPermission(adminData, "admin.roles.create")} to="/admin/accounts/roles-and-permissions/roles/new">
          {t("shared.new")}
        </ButtonPrimary>
      </div>
      {/* <InputSearchWithURL onNewRoute={getUserHasPermission(adminData, "admin.roles.create") ? "new" : undefined} /> */}
      <RolesTable items={data.items} canUpdate={getUserHasPermission(adminData, "admin.roles.update")} />
      {children}
    </div>
  );
}
