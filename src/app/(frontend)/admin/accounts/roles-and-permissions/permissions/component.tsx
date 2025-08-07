"use client";

import useAdminData from "@/lib/state/useAdminData";
import { actionAdminPermissions, AdminPermissionsLoaderData } from "./layout";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import InputFilters from "@/components/ui/input/InputFilters";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useActionState } from "react";
import PermissionsTable from "@/modules/permissions/components/PermissionsTable";

export default function ({ data, children }: { data: AdminPermissionsLoaderData; children: React.ReactNode }) {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionAdminPermissions, null);
  const adminData = useAdminData();

  return (
    <div className="space-y-2">
      <div className="flex justify-end space-x-2">
        <InputFilters filters={data.filterableProperties} withSearch={false} />
        <ButtonPrimary disabled={!getUserHasPermission(adminData, "admin.roles.create")} to="/admin/accounts/roles-and-permissions/permissions/new">
          {t("shared.new")}
        </ButtonPrimary>
      </div>
      <PermissionsTable items={actionData?.items ?? data.items} canUpdate={getUserHasPermission(adminData, "admin.roles.update")} />
      {children}
    </div>
  );
}
