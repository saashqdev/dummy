"use client";

import { UserDto } from "@/db/models";
import { DefaultPermission } from "@/modules/permissions/data/DefaultPermission";
import { PlanFeatureUsageDto } from "@/modules/subscriptions/dtos/PlanFeatureUsageDto";
import { createContext, useContext } from "react";

export type AdminDataDto = {
  user: UserDto;
  permissions: DefaultPermission[];
  isSuperAdmin: boolean;
};

export const AdminDataContext = createContext<AdminDataDto | null>(null);

export default function useAdminData(): AdminDataDto {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within a AdminDataContext.Provider");
  }
  return context;
}
