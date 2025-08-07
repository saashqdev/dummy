"use server";

import { updateAppConfiguration } from "@/modules/core/services/AppConfigurationService";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { storeSupabaseFile } from "@/modules/storage/SupabaseStorageService";
import { promiseHash } from "@/lib/utils";
import { createUserSession, getUserInfo } from "@/lib/services/session.server";
import { getServerTranslations } from "@/i18n/server";
import { revalidatePath } from "next/cache";

type ActionData = {
  success?: string;
  error?: string;
};
export const actionAdminGeneralSettings = async (prev: any, form: FormData): Promise<ActionData> => {
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  const action = form.get("action");
  if (action === "update") {
    await verifyUserHasPermission("admin.settings.general.update");

    const { name, logo, logoDarkMode, icon, iconDarkMode, favicon, theme } = {
      name: form.get("name")?.toString(),
      // url: form.get("url")?.toString(),
      logo: form.get("logo")?.toString(),
      logoDarkMode: form.get("logoDarkMode")?.toString(),
      icon: form.get("icon")?.toString(),
      iconDarkMode: form.get("iconDarkMode")?.toString(),
      favicon: form.get("favicon")?.toString(),
      theme: form.get("theme")?.toString(),
    };

    const { storedLogo, storedLogoDarkMode, storedIcon, storedIconDarkMode, storedFavicon } = await promiseHash({
      storedLogo: logo ? storeSupabaseFile({ bucket: "branding", content: logo, id: "logo" }) : Promise.resolve(""),
      storedLogoDarkMode: logoDarkMode ? storeSupabaseFile({ bucket: "branding", content: logoDarkMode, id: "logo-dark-mode" }) : Promise.resolve(""),
      storedIcon: icon ? storeSupabaseFile({ bucket: "branding", content: icon, id: "icon" }) : Promise.resolve(""),
      storedIconDarkMode: iconDarkMode ? storeSupabaseFile({ bucket: "branding", content: iconDarkMode, id: "icon-dark-mode" }) : Promise.resolve(""),
      storedFavicon: favicon ? storeSupabaseFile({ bucket: "branding", content: favicon, id: "favicon" }) : Promise.resolve(""),
    });

    const headScripts = form.get("headScripts")?.toString() ?? "";
    const bodyScripts = form.get("bodyScripts")?.toString() ?? "";

    await updateAppConfiguration({
      name,
      brandingLogo: storedLogo,
      brandingLogoDarkMode: storedLogoDarkMode,
      brandingIcon: storedIcon,
      brandingIconDarkMode: storedIconDarkMode,
      brandingFavicon: storedFavicon,
      theme,
      headScripts,
      bodyScripts,
    });
    if (theme && theme !== userInfo.theme) {
      await createUserSession({ ...userInfo, theme }, "/admin/settings/general");
    }
    revalidatePath("/admin/settings/general");
    return { success: t("shared.updated") };
  } else {
    return { error: t("shared.invalidForm") };
  }
};
