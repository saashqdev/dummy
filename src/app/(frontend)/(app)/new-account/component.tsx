"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import TenantNewForm from "@/modules/accounts/components/tenants/TenantNewForm";

export default function () {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="h-screen overflow-auto py-20">
      <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
        <div className="flex flex-shrink-0 justify-center">
          <Link href="/" className="inline-flex">
            <Logo />
          </Link>
        </div>
        <div className="sm:align-center sm:flex sm:flex-col">
          <div className="relative mx-auto w-full max-w-xl overflow-hidden px-2 py-12 sm:py-6">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("app.tenants.create.title")}</h1>
              <p className="mt-4 text-lg leading-6 text-muted-foreground">{t("app.tenants.create.headline")}</p>
            </div>
            <div className="mt-12">
              <TenantNewForm />

              <div className="mt-4 flex">
                <button type="button" onClick={() => router.back()} className="w-full text-center text-sm font-medium text-primary hover:text-primary/90">
                  <span aria-hidden="true"> &larr;</span> {t("shared.goBack")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
