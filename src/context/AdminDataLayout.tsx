"use client";

import { AdminDataContext, AdminDataDto } from "@/lib/state/useAdminData";
import { useEffect } from "react";

export default function AdminDataLayout({ children, data }: { children: React.ReactNode; data: AdminDataDto }) {
  useEffect(() => {
    try {
      // @ts-ignore
      $crisp.push(["do", "chat:hide"]);
    } catch {
      // ignore
    }
  }, []);
  return <AdminDataContext.Provider value={data}>{children}</AdminDataContext.Provider>;
}
