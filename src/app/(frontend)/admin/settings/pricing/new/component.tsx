"use client";

import { SubscriptionProductDto } from "@/modules/subscriptions/dtos/SubscriptionProductDto";
import { useActionState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { actionAdminPricingNew } from "./actions";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import PricingPlanForm from "@/modules/subscriptions/components/pricing/PricingPlanForm";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import FloatingLoader from "@/components/ui/loaders/FloatingLoader";

export default function ({ plans }: { plans: SubscriptionProductDto[] }) {
  const [actionData, action, pending] = useActionState(actionAdminPricingNew, null);
  const { t } = useTranslation();

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <IndexPageLayout title={t("admin.pricing.new")}>
      <PricingPlanForm plans={plans} serverAction={{ actionData, action, pending }} />
      <ErrorModal ref={errorModal} />
      {pending && <FloatingLoader loading={true} />}
    </IndexPageLayout>
  );
}
