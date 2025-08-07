"use client";

import useAppData from "@/lib/state/useAppData";
import { useActionState, useEffect } from "react";
import { actionAppSettingsProfile } from "./page";
import toast from "react-hot-toast";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import UserProfileSettings from "@/modules/accounts/components/users/UserProfileSettings";

export default function () {
  const appData = useAppData();
  const [actionData, action, pending] = useActionState(actionAppSettingsProfile, null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <IndexPageLayout className="pb-20">
      <UserProfileSettings user={appData.user} serverAction={{ actionData, action, pending }} />
    </IndexPageLayout>
  );
}
