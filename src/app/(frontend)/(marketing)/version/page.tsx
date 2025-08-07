"use client";

import { APP_VERSION, LAST_DEPLOYMENT } from "@/lib/constants";
import DateUtils from "@/lib/utils/DateUtils";
import HeaderBlock from "@/modules/pageBlocks/blocks/marketing/header/HeaderBlock";
import HeadingBlock from "@/modules/pageBlocks/blocks/marketing/heading/HeadingBlock";
import { useTranslation } from "react-i18next";

export default function () {
  const { t } = useTranslation();
  return (
    <div>
      <HeaderBlock />
      <HeadingBlock
        item={{
          style: "centered",
          headline: "Version",
          subheadline: "",
        }}
      />
      <div className="container mx-auto max-w-3xl space-y-6 bg-background py-8">
        <div className="flex flex-wrap justify-center gap-3">
          <div className="rounded-md border border-border bg-secondary px-2 py-1 text-sm text-secondary-foreground">Version: {APP_VERSION}</div>
          <div className="rounded-md border border-border bg-secondary px-2 py-1 text-sm text-secondary-foreground">
            Last Deployment: {DateUtils.dateYMDHMS(LAST_DEPLOYMENT)} ({DateUtils.dateAgo(LAST_DEPLOYMENT)})
          </div>
        </div>
      </div>
    </div>
  );
}
