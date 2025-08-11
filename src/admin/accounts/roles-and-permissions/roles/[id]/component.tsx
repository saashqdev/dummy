"use client";

import useAdminData from "@/lib/state/useAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useRouter } from "next/navigation";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import RoleForm from "@/modules/permissions/components/RoleForm";
import { actionAdminRolesEdit, AdminRolesEditLoaderData } from "./page";
import { useActionState } from "react";

export default function ({ data }: { data: AdminRolesEditLoaderData }) {
  const [actionData, action, pending] = useActionState(actionAdminRolesEdit, null);
  const adminData = useAdminData();
  const router = useRouter();
  function goBack() {
    router.replace("/admin/accounts/roles-and-permissions/roles");
  }
  return (
    <SlideOverFormLayout title={data.item.name} description={data.item.description} onClosed={goBack}>
      <RoleForm
        item={data.item}
        permissions={data.permissions}
        onCancel={goBack}
        canUpdate={getUserHasPermission(adminData, "admin.roles.update")}
        canDelete={getUserHasPermission(adminData, "admin.roles.delete")}
        serverAction={{ actionData, action, pending }}
      />
    </SlideOverFormLayout>
  );
}
