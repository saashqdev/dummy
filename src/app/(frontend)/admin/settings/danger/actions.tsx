"use server";

import { deleteAppConfiguration } from "@/modules/core/services/AppConfigurationService";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { revalidatePath } from "next/cache";

export const actionAdminDangerSettings = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations();
  const action = form.get("action");
  if (action === "delete") {
    await verifyUserHasPermission("admin.settings.danger.reset");
    await deleteAppConfiguration();
    revalidatePath("/admin/settings/danger");
    return { success: "Configuration reset successfully" };
  } else {
    return { error: t("shared.invalidForm") };
  }
};
