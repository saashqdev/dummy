"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputGroup from "@/components/ui/forms/InputGroup";
import InputImage from "@/components/ui/input/InputImage";
import useAdminData from "@/lib/state/useAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { defaultThemes } from "@/lib/themes";
import InputSelect from "@/components/ui/input/InputSelect";
import clsx from "clsx";
import toast from "react-hot-toast";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useRootData from "@/lib/state/useRootData";
import { actionAdminGeneralSettings } from "./actions";

export default function AdminSettingsGeneral() {
  const { t } = useTranslation();
  const { appConfiguration } = useRootData();
  const adminData = useAdminData();
  const [actionData, action, pending] = useActionState(actionAdminGeneralSettings, null);

  const [logoLight, setLogoLight] = useState(appConfiguration.branding.logo ?? "");
  const [logoDarkMode, setLogoDarkMode] = useState(appConfiguration.branding.logoDarkMode ?? "");
  const [iconLight, setIconLight] = useState(appConfiguration.branding.icon ?? "");
  const [iconDarkMode, setIconDarkMode] = useState(appConfiguration.branding.iconDarkMode ?? "");
  const [favicon, setFavicon] = useState(appConfiguration.branding.favicon ?? "");

  const [canUpdate] = useState(getUserHasPermission(adminData, "admin.settings.general.update"));

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);
  return (
    <IndexPageLayout title={t("settings.admin.general.title")} className="pb-20">
      <form action={action} className="mt-6 space-y-8">
        <input name="action" value="update" hidden readOnly />
        <InputGroup title="General">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="mb-1 text-xs font-medium">
                Application name <span className="text-red-500">*</span>
              </label>
              <Input name="name" title="Application name" defaultValue={appConfiguration.app.name ?? ""} disabled={!canUpdate} required />
            </div>
            <div className="sm:col-span-3">
              <div className="w-full">
                <div>
                  <label className="mb-1 text-xs font-medium">Theme</label>
                  <InputSelect
                    name="theme"
                    defaultValue={appConfiguration.theme.color ?? ""}
                    options={defaultThemes.map((item) => ({
                      name: item.name,
                      value: item.value,
                      component: (
                        <div className="flex items-center space-x-2">
                          <div
                            className={clsx(
                              `theme-${item.value}`,
                              "inline-flex flex-shrink-0 items-center rounded-full bg-primary text-xs font-medium text-primary"
                            )}
                          >
                            <svg className={clsx("h-2 w-2")} fill="currentColor" viewBox="0 0 8 8">
                              <circle cx={4} cy={4} r={3} />
                            </svg>
                          </div>
                          <div>{item.name}</div>
                        </div>
                      ),
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </InputGroup>

        <InputGroup title="Branding">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-3">
              <InputImage name="logo" title="Logo (Light Mode)" value={logoLight} onChange={setLogoLight} disabled={!canUpdate} />
            </div>
            <div className="sm:col-span-3">
              <InputImage name="logoDarkMode" title="Logo (Dark Mode)" value={logoDarkMode} onChange={setLogoDarkMode} disabled={!canUpdate} className="dark" />
            </div>
            <div className="sm:col-span-3">
              <InputImage name="icon" title="Icon" value={iconLight} onChange={setIconLight} disabled={!canUpdate} />
            </div>
            <div className="sm:col-span-3">
              <InputImage name="iconDarkMode" title="Icon (Dark Mode)" value={iconDarkMode} onChange={setIconDarkMode} disabled={!canUpdate} className="dark" />
            </div>
            <div className="sm:col-span-6">
              <InputImage name="favicon" title="Favicon" value={favicon} onChange={setFavicon} disabled={!canUpdate} />
            </div>
          </div>
        </InputGroup>

        <InputGroup title="Scripts">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-3">
              <label htmlFor="headScripts" className="mb-1 text-xs font-medium">
                Head scripts
              </label>
              <Textarea
                name="headScripts"
                title="Head scripts"
                defaultValue={appConfiguration.scripts.head ?? ""}
                disabled={!canUpdate}
                rows={10}
                placeholder={`<head>
...
your scripts here
</head>`}
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="bodyScripts" className="mb-1 text-xs font-medium">
                Body scripts
              </label>
              <Textarea
                name="bodyScripts"
                title="Body scripts"
                defaultValue={appConfiguration.scripts.body ?? ""}
                disabled={!canUpdate}
                rows={10}
                placeholder={`<body>
...
your scripts here
</body>`}
              />
            </div>
          </div>
        </InputGroup>

        <div className="flex justify-end">
          <LoadingButton isLoading={pending} type="submit" disabled={!getUserHasPermission(adminData, "admin.settings.general.update")}>
            {t("shared.save")}
          </LoadingButton>
        </div>
      </form>
    </IndexPageLayout>
  );
}
