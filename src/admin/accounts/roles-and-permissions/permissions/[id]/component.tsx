"use client";

import useAdminData from "@/lib/state/useAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import { actionAdminPermissionsEdit, AdminPermissionsEditLoaderData } from "./page";
import { useRouter } from "next/navigation";
import PermissionForm from "@/modules/permissions/components/PermissionForm";
import { useActionState } from "react";

export default function ({ data }: { data: AdminPermissionsEditLoaderData }) {
  const [actionData, action, pending] = useActionState(actionAdminPermissionsEdit, null);
  const adminData = useAdminData();
  const router = useRouter();
  function goBack() {
    router.replace("/admin/accounts/roles-and-permissions/permissions");
  }
  return (
    <SlideOverFormLayout title={data.item.name} description={data.item.description} onClosed={goBack}>
      <PermissionForm
        item={data.item}
        roles={data.roles}
        onCancel={goBack}
        canUpdate={getUserHasPermission(adminData, "admin.roles.update")}
        canDelete={getUserHasPermission(adminData, "admin.roles.delete")}
        serverAction={{ actionData, action, pending }}
      />
    </SlideOverFormLayout>
  );
}
