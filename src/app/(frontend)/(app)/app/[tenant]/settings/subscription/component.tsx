"use client";

import { AppSettingsSubscriptionLoaderData } from "./page";
import useAppData from "@/lib/state/useAppData";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import SubscriptionSettings from "@/modules/subscriptions/components/SubscriptionSettings";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import { useTranslation } from "react-i18next";

export default function ({ data }: { data: AppSettingsSubscriptionLoaderData }) {
  const { t } = useTranslation();
  const appData = useAppData();

  return (
    <IndexPageLayout className="mb-12">
      {"error" in data ? (
        <ErrorBanner title={t("shared.error")} text={data.error} />
      ) : (
        <SubscriptionSettings {...data} mySubscription={appData.mySubscription} currentTenant={appData.currentTenant} />
      )}
    </IndexPageLayout>
  );
}
