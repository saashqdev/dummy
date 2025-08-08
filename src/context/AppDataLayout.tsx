"use client";

import { AppDataContext, AppDataDto } from "@/lib/state/useAppData";
import useRootData from "@/lib/state/useRootData";
import UrlUtils from "@/lib/utils/UrlUtils";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppDataLayout({ children, data }: { children: React.ReactNode; data: AppDataDto }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { appConfiguration } = useRootData();
  useEffect(() => {
    if (!data.currentTenant) {
      router.push("/app");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.currentTenant]);

  useEffect(() => {
    if (!UrlUtils.stripTrailingSlash(pathname).startsWith(`/app/${params.tenant}/settings`)) {
      if (appConfiguration.subscription.required && data.mySubscription?.products.length === 0) {
        router.push(`/subscribe/${params.tenant}?error=subscription_required`);
      }
    }
  }, [pathname]);

  return <AppDataContext.Provider value={data}>{children}</AppDataContext.Provider>;
}
