"use client";

import useAdminData from "@/lib/state/useAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import { actionAdminPermissionsEdit, AdminPermissionsNewLoaderData } from "./page";
import { useRouter } from "next/navigation";
import PermissionForm from "@/modules/permissions/components/PermissionForm";
import { useActionState } from "react";

export default function ({ data }: { data: AdminPermissionsNewLoaderData }) {
  const [actionData, action, pending] = useActionState(actionAdminPermissionsEdit, null);
  const adminData = useAdminData();
  const router = useRouter();
  function goBack() {
    router.replace("/admin/accounts/roles-and-permissions/permissions");
  }
  return (
    <SlideOverFormLayout title={"New Permission"} description="" onClosed={goBack}>
      <PermissionForm
        roles={data.roles}
        onCancel={goBack}
        canUpdate={getUserHasPermission(adminData, "admin.roles.update")}
        canDelete={getUserHasPermission(adminData, "admin.roles.delete")}
        serverAction={{ actionData, action, pending }}
      />
    </SlideOverFormLayout>
  );
}
