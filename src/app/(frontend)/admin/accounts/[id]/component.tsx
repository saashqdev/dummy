"use client";

import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import useAdminData from "@/lib/state/useAdminData";
import { useEffect, useRef, useActionState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { actionAdminAccountEdit, AdminAccountEditLoaderData } from "./page";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import SettingSection from "@/components/ui/sections/SettingSection";
import UpdateTenantDetailsForm from "@/modules/accounts/components/tenants/UpdateTenantDetailsForm";
import UsersTable from "@/modules/accounts/components/users/UsersTable";
import toast from "react-hot-toast";

export default function ({ data }: { data: AdminAccountEditLoaderData }) {
  const adminData = useAdminData();
  const params = useParams();
  const [actionData, action, pending] = useActionState(actionAdminAccountEdit, null);
  const { t } = useTranslation();

  const confirmDelete = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  function deleteAccount() {
    confirmDelete.current?.show(t("settings.danger.confirmDeleteTenant"), t("shared.confirm"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function confirmDeleteTenant() {
    const form = new FormData();
    form.set("action", "delete-tenant");
    form.set("id", data.tenant.id);
    action(form);
  }

  return (
    <IndexPageLayout
      title={data.tenant.name}
      menu={[
        { title: t("models.tenant.plural"), routePath: "/admin/accounts" },
        { title: data.tenant?.name ?? "", routePath: "/admin/accounts/" + params.id },
      ]}
    >
      <div className="pb-20">
        <SettingSection title={t("settings.tenant.general")} description={t("settings.tenant.generalDescription")}>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <UpdateTenantDetailsForm
              tenant={data.tenant}
              disabled={!getUserHasPermission(adminData, "admin.account.settings.update")}
              serverAction={{ actionData, action, pending }}
            />
          </div>
        </SettingSection>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-t border-border"></div>
          </div>
        </div>

        {/* Tenant Users */}
        {getUserHasPermission(adminData, "admin.account.users") && (
          <Fragment>
            <SettingSection title={t("models.user.plural")} className="">
              <UsersTable
                items={data.users}
                canChangePassword={getUserHasPermission(adminData, "admin.users.changePassword")}
                canSetUserRoles={false}
                canDelete={getUserHasPermission(adminData, "admin.users.delete")}
              />
            </SettingSection>

            {/*Separator */}
            <div className="block">
              <div className="py-5">
                <div className="border-t border-border"></div>
              </div>
            </div>
          </Fragment>
        )}

        {/*Danger */}
        {getUserHasPermission(adminData, "admin.account.delete") && (
          <SettingSection title={t("settings.danger.title")} description={t("settings.danger.description")}>
            <div className="mt-12 md:col-span-2 md:mt-0">
              <div>
                <input hidden type="text" name="action" value="deleteAccount" readOnly />
                <div className="">
                  <div className="">
                    <h3 className="text-lg font-medium leading-6 text-foreground">Delete account</h3>
                    <div className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                      <p>Delete organization and cancel subscriptions.</p>
                    </div>
                    <div className="mt-4">
                      <ButtonPrimary destructive={true} onClick={deleteAccount}>
                        {t("settings.danger.deleteAccount")}
                      </ButtonPrimary>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SettingSection>
        )}

        <ConfirmModal ref={confirmDelete} onYes={confirmDeleteTenant} destructive />
      </div>
    </IndexPageLayout>
  );
}
