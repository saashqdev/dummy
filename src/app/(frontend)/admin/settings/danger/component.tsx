"use client";

import { useActionState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { actionAdminDangerSettings } from "./actions";
import useRootData from "@/lib/state/useRootData";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";

export default function Component({}) {
  const { t } = useTranslation();
  const { appConfiguration } = useRootData();
  const [actionData, action, pending] = useActionState(actionAdminDangerSettings, null);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData?.error);
    } else if (actionData?.success) {
      toast.success(actionData?.success);
    }
  }, [actionData]);
  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("settings.admin.danger.title")}</h1>

        <form action={action} className="divide-y-gray-200 mt-6 space-y-8 divide-y">
          <input name="action" value="delete" hidden readOnly />
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-6">
              <h2 className="text-xl font-medium text-gray-900">Reset</h2>
              <p className="mt-1 text-sm text-gray-500">Go back to the initial application configuration.</p>
            </div>
            <div className="sm:col-span-6">
              <h2 className="font-medium text-gray-900">Current configuration</h2>
              <div className="prose mt-1">
                <pre>{JSON.stringify(appConfiguration, null, 2)}</pre>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <ButtonPrimary destructive type="submit">
              {t("settings.reset")}
            </ButtonPrimary>
          </div>
        </form>
      </div>
    </div>
  );
}
