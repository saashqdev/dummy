"use client";

import { useTranslation } from "react-i18next";
import { actionAppSubscribeTenant, AppSubscribeTenantLoaderData } from "./page";
import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import PlansGrouped from "@/modules/subscriptions/components/PlansGrouped";

export default function ({ data }: { data: AppSubscribeTenantLoaderData }) {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionAppSubscribeTenant, null);
  const search = useSearchParams();
  const searchParams = new URLSearchParams(search);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="pt-4">
      <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
        <div className="flex flex-shrink-0 justify-center">
          <div className="mt-4 flex">
            <Link href={`/app/${data.currentTenant.slug}/settings/subscription`} className="w-full text-center text-sm font-medium hover:underline">
              <span aria-hidden="true"> &larr;</span> {t("settings.subscription.goToSubscription")}
            </Link>
          </div>
        </div>
        <div className="sm:align-center sm:flex sm:flex-col">
          <div className="relative mx-auto w-full max-w-7xl space-y-4 overflow-hidden px-2 py-12 sm:py-6">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("front.pricing.title")}</h1>
              <p className="mt-4 text-lg leading-6 text-muted-foreground">
                {searchParams.get("error")?.toString() === "subscription_required" ? (
                  <span className="text-red-500">{t("pricing.required")}</span>
                ) : (
                  <span>{t("front.pricing.headline")}</span>
                )}
              </p>
            </div>
            {data?.items && (
              <PlansGrouped
                items={data.items}
                canSubmit={true}
                tenantSubscription={data.mySubscription}
                stripeCoupon={data.coupon?.stripeCoupon || null}
                currenciesAndPeriod={data.currenciesAndPeriod}
                serverAction={{ actionData, action, pending }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
