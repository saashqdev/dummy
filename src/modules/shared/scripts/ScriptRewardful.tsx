/* eslint-disable @next/next/no-before-interactive-script-outside-document */

"use client";

import { Fragment } from "react";
import useRootData from "@/lib/state/useRootData";
import Script from "next/script";

export default function ScriptRewardful() {
  const rootData = useRootData();
  const affiliates = rootData.appConfiguration.affiliates;
  if (!affiliates) {
    return null;
  }
  if (!affiliates.provider || !affiliates.provider.rewardfulApiKey) {
    return null;
  }
  return (
    <Fragment>
      <Script src={"https://r.wdfl.co/rw.js"} data-rewardful={affiliates.provider.rewardfulApiKey}></Script>
      <Script id="rewardful-queue" strategy="beforeInteractive">
        {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
      </Script>
    </Fragment>
  );
}
