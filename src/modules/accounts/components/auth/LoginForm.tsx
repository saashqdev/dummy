"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import ExclamationTriangleIcon from "@/components/ui/icons/ExclamationTriangleIcon";
import { Input } from "@/components/ui/input";
// import useRootData from "@/lib/state/useRootData";
import { actionLogin } from "../../services/AuthService";
import { useSearchParams } from "next/navigation";
import { AppConfigurationDto } from "@/modules/core/dtos/AppConfigurationDto";
import Link from "next/link";

export type LoginActionData = {
  error?: string;
  fieldErrors?: {
    email: string | undefined;
    password: string | undefined;
  };
};

export default function LoginForm({ appConfiguration, redirectTo }: { appConfiguration: AppConfigurationDto; redirectTo?: string }) {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionLogin, null);
  const searchParams = useSearchParams();

  const emailInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setTimeout(() => {
      emailInput.current?.focus();
    }, 300);
  }, [actionData]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center">
        <h1 className="text-left text-2xl font-extrabold">{t("account.login.headline")}</h1>
        <p className="mt-1 text-left">
          <Link href={appConfiguration.subscription.allowSignUpBeforeSubscribe ? "/register" : "/pricing"} className="font-medium text-primary hover:underline">
            {t("account.login.orRegister")}
          </Link>
        </p>
      </div>

      <div className="mx-auto flex flex-col items-center space-y-6 rounded-lg border border-border p-6">
        <form action={action} className="w-full space-y-3">
          <input type="hidden" name="action" value="login" hidden readOnly />
          <input type="hidden" name="redirectTo" value={redirectTo ?? searchParams.get("redirect") ?? undefined} />
          <div>
            <label htmlFor="email" className="mb-1 text-xs font-medium">
              {t("account.shared.email")} <span className="text-red-500">*</span>
            </label>
            <Input
              ref={emailInput}
              title={t("account.shared.email")}
              autoFocus
              id="email"
              name="email"
              type="email"
              required
              placeholder="email@address.com"
              disabled={pending}
              defaultValue={actionData?.email}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 text-xs font-medium">
              {t("account.shared.password")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              title={t("account.shared.password")}
              name="password"
              type="password"
              required
              placeholder="************"
              disabled={pending}
              defaultValue=""
            />
          </div>
          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="inline-block align-baseline text-xs font-medium text-foreground hover:underline">
              {t("account.login.forgot")}
            </Link>
            <LoadingButton isLoading={pending} disabled={pending} className="block w-full" type="submit" actionName="login">
              {t("account.login.button")}
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
    </div>
  );
}
