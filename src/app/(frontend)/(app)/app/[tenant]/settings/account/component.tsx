"use client";

import useAppData from "@/lib/state/useAppData";
import { useActionState, useEffect, useRef } from "react";
import { actionAppSettingsAccount } from "./page";
import toast from "react-hot-toast";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import { useTranslation } from "react-i18next";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import SettingSection from "@/components/ui/sections/SettingSection";
import UpdateTenantDetailsForm from "@/modules/accounts/components/tenants/UpdateTenantDetailsForm";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";

export default function () {
  const { t } = useTranslation();
  const appData = useAppData();
  const [actionData, action, pending] = useActionState(actionAppSettingsAccount, null);

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
    form.set("action", "delete");
    // submit(form, { method: "post" });
    action(form);
  }

  return (
    <IndexPageLayout>
      <SettingSection title={t("settings.tenant.general")} description={t("settings.tenant.generalDescription")}>
        <UpdateTenantDetailsForm
          tenant={appData.currentTenant}
          disabled={!getUserHasPermission(appData, "app.settings.account.update")}
          serverAction={{ actionData, action, pending }}
        />
      </SettingSection>

      {/*Separator */}
      <div className="block">
        <div className="py-5">
          <div className="border-t border-border"></div>
        </div>
      </div>

      {/*Danger */}
      <SettingSection title={t("settings.danger.title")} description={t("settings.danger.description")}>
        <div className="mt-12 md:col-span-2 md:mt-0">
          <div>
            <input hidden type="text" name="action" value="deleteAccount" readOnly />
            <div>
              <ButtonPrimary disabled={!getUserHasPermission(appData, "app.settings.account.delete")} destructive={true} onClick={deleteAccount}>
                {t("settings.danger.deleteAccount")}
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </SettingSection>

      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteTenant} destructive />
    </IndexPageLayout>
  );
}
