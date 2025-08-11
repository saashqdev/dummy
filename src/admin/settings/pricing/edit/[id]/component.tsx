"use client";

import { SubscriptionProductDto } from "@/modules/subscriptions/dtos/SubscriptionProductDto";
import { useActionState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { actionAdminPricingEdit } from "./actions";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import PricingPlanForm from "@/modules/subscriptions/components/pricing/PricingPlanForm";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import useAdminData from "@/lib/state/useAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

interface Props {
  item: SubscriptionProductDto;
  plans: SubscriptionProductDto[];
}
export default function ({ item, plans }: Props) {
  const [actionData, action, pending] = useActionState(actionAdminPricingEdit, null);
  const adminData = useAdminData();
  const { t } = useTranslation();

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
  }, [actionData]);

  return (
    <IndexPageLayout title={t(item.title)}>
      <PricingPlanForm
        item={item}
        plans={plans}
        canUpdate={getUserHasPermission(adminData, "admin.pricing.update")}
        canDelete={getUserHasPermission(adminData, "admin.pricing.delete")}
        serverAction={{ actionData, action, pending }}
      />
      <ErrorModal ref={errorModal} />
    </IndexPageLayout>
  );
}
