"use client";

import Logo from "@/components/brand/Logo";
import SuccessBanner from "@/components/ui/banners/SuccessBanner";
import { RegisterForm } from "@/modules/accounts/components/auth/RegisterForm";
import { actionRegister } from "@/modules/accounts/services/AuthService";
import Link from "next/link";
import { useActionState } from "react";
import { useTranslation } from "react-i18next";

export default function () {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionRegister, null);

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />
          <div className="flex flex-col items-center">
            {!actionData?.verificationEmailSent ? (
              <>
                <h1 className="text-left text-2xl font-extrabold">{t("account.register.title")}</h1>
                <p className="mt-1 text-center">
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    {t("account.register.clickHereToLogin")}
                  </Link>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-left text-2xl font-extrabold">{t("account.verify.title")}</h1>
                <div className="mt-8">
                  <SuccessBanner title={t("shared.success")} text={t("account.verify.emailSent")} />
                </div>
              </>
            )}
          </div>

          {!actionData?.verificationEmailSent && <RegisterForm serverAction={{ actionData, action, pending }} />}
        </div>
      </div>
    </div>
  );
}
