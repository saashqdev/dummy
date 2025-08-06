"use client";

import { useEffect } from "react";
import useRootData from "@/lib/state/useRootData";
import { usePathname } from "next/navigation";

const START_HIDDEN_IN_ROUTES = ["/admin", "/app"];

export default function ScriptCrisp() {
  const rootData = useRootData();
  const pathname = usePathname();

  useEffect(() => {
    if (rootData.chatWebsiteId && !window.$crisp) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = rootData.chatWebsiteId;
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      d.getElementsByTagName("head")[0].appendChild(s);
    }
    if (window.$crisp && START_HIDDEN_IN_ROUTES.some((p) => pathname.startsWith(p))) {
      try {
        // @ts-ignore
        window.$crisp.push(["do", "chat:hide"]);
      } catch {
        // ignore
      }
    }
  }, [rootData.chatWebsiteId, pathname]);

  return null;
}

declare global {
  interface Window {
    $crisp: any;
    CRISP_WEBSITE_ID: string;
  }
}
