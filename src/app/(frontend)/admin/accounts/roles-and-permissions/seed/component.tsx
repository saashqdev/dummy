"use client";

import useAdminData from "@/lib/state/useAdminData";
import { useTranslation } from "react-i18next";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useActionState, useEffect } from "react";
import { actionAdminRolesSeed, AdminRolesSeedLoaderData } from "./page";
import toast from "react-hot-toast";
import InputGroup from "@/components/ui/forms/InputGroup";
import TableSimple from "@/components/ui/tables/TableSimple";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import LoadingButton from "@/components/ui/buttons/LoadingButton";

export default function ({ data }: { data: AdminRolesSeedLoaderData }) {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionAdminRolesSeed, null);
  const adminData = useAdminData();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  function onSeed() {
    const form = new FormData();
    form.set("action", "seed");
    action(form);
  }

  return (
    <div className="space-y-4">
      <InputGroup title={"Missing roles & permissions"}>
        <div className="space-y-2">
          <h3 className="font-medium">{t("models.role.plural")}</h3>
          <TableSimple
            items={data.roles.missing}
            headers={[
              {
                name: "type",
                title: t("shared.type"),
                value: (i) => i.type,
              },
              {
                name: "name",
                title: t("shared.name"),
                value: (i) => i.name,
                className: "w-full",
              },
            ]}
          />

          <h3 className="font-medium">{t("models.permission.plural")}</h3>
          <TableSimple
            items={data.permissions.missing}
            headers={[
              {
                name: "type",
                title: t("shared.type"),
                value: (i) => i.type,
              },
              {
                name: "name",
                title: t("shared.name"),
                value: (i) => i.name,
              },
              {
                name: "description",
                title: t("shared.description"),
                value: (i) => i.description,
                className: "w-full",
              },
              {
                name: "inRoles",
                title: "In roles",
                value: (i) => i.inRoles.join(", "),
              },
            ]}
          />

          <div className="flex justify-end">
            <LoadingButton isLoading={pending} disabled={!getUserHasPermission(adminData, "admin.roles.create")} onClick={onSeed}>
              Seed default: {data.roles.missing.length}/{data.roles.all.length} roles and {data.permissions.missing.length}/{data.permissions.all.length}{" "}
              permissions
            </LoadingButton>
          </div>
        </div>
      </InputGroup>

      <InfoBanner title={"Info"}>
        Use this page after you have added new roles and/or permissions on the file: <code>app/modules/permissions/data/DefaultRoles.ts</code>
      </InfoBanner>
    </div>
  );
}
