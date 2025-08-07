"use server";

import { getServerTranslations } from "@/i18n/server";
import { updateAppConfiguration } from "@/modules/core/services/AppConfigurationService";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { revalidatePath } from "next/cache";

export const actionAuthenticationSettings = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations();
  const action = form.get("action");
  if (action === "update") {
    await verifyUserHasPermission("admin.settings.authentication.update");
    await updateAppConfiguration({
      authRequireEmailVerification: Boolean(form.get("requireEmailVerification")),
      authRequireOrganization: Boolean(form.get("requireOrganization")),
      authRequireName: Boolean(form.get("requireName")),
      subscriptionRequired: Boolean(form.get("required")),
      subscriptionAllowSubscribeBeforeSignUp: Boolean(form.get("allowSubscribeBeforeSignUp")),
      subscriptionAllowSignUpBeforeSubscribe: Boolean(form.get("allowSignUpBeforeSubscribe")),
    });
    revalidatePath("/admin/settings/authentication");
    return { success: t("shared.updated") };
  } else {
    return { error: t("shared.invalidForm") };
  }
};
