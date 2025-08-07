"use client";

import { UserDto } from "@/db/models";
import { MetaTagsDto } from "@/lib/dtos/MetaTagsDto";
import { UserSessionDto } from "@/lib/services/session.server";
import { AppConfigurationDto } from "@/modules/core/dtos/AppConfigurationDto";
import { createContext, useContext } from "react";

export type RootDataDto = {
  metatags: MetaTagsDto;
  user: UserDto | null;
  theme: { color: string; scheme: string };
  locale: string;
  serverUrl: string;
  domainName: string;
  userSession: UserSessionDto;
  authenticated: boolean;
  debug: boolean;
  isStripeTest: boolean;
  chatWebsiteId?: string;
  appConfiguration: AppConfigurationDto;
  csrf?: string;
};

export const RootDataContext = createContext<RootDataDto | null>(null);

export default function useRootData(): RootDataDto {
  const context = useContext(RootDataContext);
  if (!context) {
    throw new Error("useRootData must be used within a RootDataContext.Provider");
  }
  return context;
}
