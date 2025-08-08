import { DefaultPermission } from "@/modules/permissions/data/DefaultPermission";

export function getUserHasPermission(appOrAdminData: { permissions: DefaultPermission[]; isSuperAdmin: boolean }, permission: DefaultPermission) {
  if (appOrAdminData?.permissions === undefined) {
    return true;
  }
  if (appOrAdminData.isSuperAdmin) {
    return true;
  }
  return appOrAdminData.permissions.includes(permission);
}
