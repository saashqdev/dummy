"use client";

import { RootDataContext, RootDataDto } from "../lib/state/useRootData";
import { dir } from "i18next";
import ScriptCrisp from "@/modules/shared/scripts/ScriptCrisp";
import ScriptAnalytics from "@/modules/shared/scripts/ScriptAnalytics";
import ScriptRewardful from "@/modules/shared/scripts/ScriptRewardful";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Toaster as ReactHostToaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ScriptInjector from "@/modules/shared/scripts/ScriptInjector";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootDataLayout({ children, rootData, lng, scheme }: { children: React.ReactNode; rootData: RootDataDto; lng: string; scheme: string }) {
  const pathname = usePathname();
  return (
    <html lang={lng} dir={dir(lng)} className={["/app/", "/admin/"].some((p) => pathname.startsWith(p)) ? "" : scheme === "dark" ? "dark" : ""}>
      <RootDataContext.Provider value={rootData}>
        <body className={clsx(`theme-${rootData.theme.color}`, "max-h-full min-h-screen max-w-full bg-background text-foreground", inter.style)}>
          {children}
          <ScriptCrisp />
          <ScriptAnalytics />
          <ScriptRewardful />
          <ReactHostToaster />
          <SonnerToaster />
          <ScriptInjector scripts={rootData.appConfiguration?.scripts} />
        </body>
      </RootDataContext.Provider>
    </html>
  );
}
