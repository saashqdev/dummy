"use client";

import useAdminData from "@/lib/state/useAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useRouter } from "next/navigation";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import RoleForm from "@/modules/permissions/components/RoleForm";
import { useActionState } from "react";
import { actionAdminRolesNew, AdminRolesNewLoaderData } from "./page";

export default function ({ data }: { data: AdminRolesNewLoaderData }) {
  const [actionData, action, pending] = useActionState(actionAdminRolesNew, null);
  const adminData = useAdminData();
  const router = useRouter();
  function goBack() {
    router.replace("/admin/accounts/roles-and-permissions/roles");
  }
  return (
    <SlideOverFormLayout title="New Role" description="" onClosed={goBack}>
      <RoleForm
        permissions={data.permissions}
        onCancel={goBack}
        canUpdate={getUserHasPermission(adminData, "admin.roles.update")}
        canDelete={getUserHasPermission(adminData, "admin.roles.delete")}
        serverAction={{ actionData, action, pending }}
      />
    </SlideOverFormLayout>
  );
}
