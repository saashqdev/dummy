"use client";

import { useTranslation } from "react-i18next";
import { actionForgotPassword } from "./page";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Logo from "@/components/brand/Logo";
import Link from "next/link";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import ExclamationTriangleIcon from "@/components/ui/icons/ExclamationTriangleIcon";
import SuccessBanner from "@/components/ui/banners/SuccessBanner";

export default function ForgotPasswordRoute() {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionForgotPassword, null);

  const search = useSearchParams();
  const searchParams = new URLSearchParams(search);

  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
    if (actionData?.success) {
      setEmailSent(true);
      toast.success(actionData.success);
    }
  }, [actionData]);

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />
          <div className="flex flex-col items-center">
            <div className="text-left text-2xl font-extrabold">{t("account.forgot.title")}</div>
            <div className="mt-1 text-center">
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t("account.register.clickHereToLogin")}
              </Link>
            </div>
          </div>

          <div className="mx-auto flex flex-col items-center space-y-6 rounded-lg border border-border p-6">
            <form action={action} className="w-full space-y-3">
              <div>
                <label htmlFor="email" className="mb-1 text-xs font-medium">
                  {t("account.shared.email")} <span className="text-red-500">*</span>
                </label>
                <Input
                  title={t("account.shared.email")}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@address.com"
                  required
                  defaultValue={searchParams.get("e")?.toString()}
                />
              </div>
              <div className="flex items-center justify-end">
                <LoadingButton type="submit" className="w-full">
                  {t("account.reset.button")}
                </LoadingButton>
              </div>
              <div id="form-error-message">
                {actionData?.error && !pending ? (
                  <div className="flex items-center justify-center space-x-2 text-sm text-red-500 dark:text-red-300" role="alert">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <div>{actionData.error}</div>
                  </div>
                ) : null}
              </div>
            </form>
          </div>

          {emailSent && (
            <div className="mt-8">
              <SuccessBanner title={t("account.reset.resetSuccess")} text={t("account.reset.emailSent")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
