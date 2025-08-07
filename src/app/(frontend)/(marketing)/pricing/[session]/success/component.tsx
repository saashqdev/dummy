"use client";

import Logo from "@/components/brand/Logo";
import { RegisterForm } from "@/modules/accounts/components/auth/RegisterForm";
import { useActionState } from "react";
import { useTranslation } from "react-i18next";
import { actionPricingSuccess } from "./actions";
import { PricingSessionSuccessLoaderData } from "./page";
import { useParams } from "next/navigation";

export default function ({ data }: { data: PricingSessionSuccessLoaderData }) {
  const { t } = useTranslation();
  const params = useParams();
  const [actionData, action, pending] = useActionState(actionPricingSuccess, null);

  return (
    <div>
      <div className="">
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-sm space-y-5">
            <Logo className="mx-auto h-12 w-auto" />

            <div className="flex flex-col items-center">
              {data.error ? (
                <>
                  <h1 className="text-left text-2xl font-extrabold">Unexpected Error</h1>
                  <p className="mt-1 text-center text-sm text-red-500">{data.error}</p>
                </>
              ) : !data.checkoutSession ? (
                <>
                  <h1 className="text-left text-2xl font-extrabold">Error</h1>
                  <p className="mt-1 text-center text-sm text-red-500">Invalid checkout session</p>
                </>
              ) : (
                <>
                  <h1 className="text-left text-2xl font-extrabold">{t("account.register.setup")}</h1>
                  <p className="mt-1 text-center text-sm">Thank you for subscribing to {t(data.checkoutSession.products.map((f) => t(f.title)).join(", "))}</p>
                </>
              )}
            </div>

            {data.checkoutSession && !data.error && (
              <RegisterForm
                data={{
                  email: data.checkoutSession.customer.email,
                }}
                isSettingUpAccount={true}
                checkoutSessionId={params?.session?.toString()}
                serverAction={{ actionData, action, pending }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
