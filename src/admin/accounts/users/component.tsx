"use client";

import { useTranslation } from "react-i18next";
import { actionAdminUsers, AdminUsersLoaderData } from "./layout";
import { useActionState, useEffect } from "react";
import useAdminData from "@/lib/state/useAdminData";
import toast from "react-hot-toast";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import InputFilters from "@/components/ui/input/InputFilters";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import UsersTable from "@/modules/accounts/components/users/UsersTable";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

export default function ({ data, children }: { data: AdminUsersLoaderData; children: React.ReactNode }) {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionAdminUsers, null);
  const adminData = useAdminData();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <IndexPageLayout
      title={t("models.user.plural")}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} withSearch={false} />
          <ButtonPrimary disabled={!getUserHasPermission(adminData, "admin.accounts.create")} to="/admin/accounts/users/new">
            {t("shared.new")}
          </ButtonPrimary>
        </>
      }
    >
      <UsersTable
        items={data.items}
        canChangePassword={getUserHasPermission(adminData, "admin.users.changePassword")}
        canDelete={getUserHasPermission(adminData, "admin.users.delete")}
        canSetUserRoles={getUserHasPermission(adminData, "admin.roles.set")}
        pagination={data.pagination}
        serverAction={{ actionData, action, pending }}
      />
      {children}
    </IndexPageLayout>
  );
}
