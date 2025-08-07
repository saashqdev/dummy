"use server";

import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { cache, clearAllCache, getCachedValues } from "@/lib/services/cache.server";
import { revalidatePath, revalidateTag } from "next/cache";

type ActionData = {
  success?: string;
  error?: string;
};
export const actionAdminCache = async (prev: any, form: FormData): Promise<ActionData> => {
  await verifyUserHasPermission("admin.settings.general.update");
  const action = form.get("action")?.toString() ?? "";
  if (action === "delete-key") {
    const key = form.get("key")?.toString() ?? "";
    cache.delete(key);
    return { success: "Key deleted" };
  } else if (action === "delete-all") {
    let keys = await getCachedValues();
    await clearAllCache();
    return { success: "Cache cleared: " + keys.length + " keys deleted" };
  } else if (action === "delete-keys") {
    const keys = form.get("keys")?.toString() ?? "";
    const keysArray = keys.split(",");
    let keyCount = 0;
    for (const key of keysArray) {
      cache.delete(key);
      keyCount++;
    }
    // revalidatePath("/admin/settings/cache");
    // revalidateTag("admin-settings-cache");
    return { success: "Keys deleted: " + keyCount };
  }
  return { error: "Invalid action" };
};
