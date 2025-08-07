"use client";

import useAppData from "@/lib/state/useAppData";
import { AppSettingsLayoutLoaderData } from "./layout";
import { useTranslation } from "react-i18next";
import CompanyIcon from "@/components/ui/icons/CompanyIcon";
import CompanyIconFilled from "@/components/ui/icons/CompanyIconFilled";
import CreditsIcon from "@/components/ui/icons/CreditsIcon";
import CreditsIconFilled from "@/components/ui/icons/CreditsIconFilled";
import CustomerIcon from "@/components/ui/icons/CustomerIcon";
import CustomerIconFilled from "@/components/ui/icons/CustomerIconFilled";
import ExperimentIcon from "@/components/ui/icons/ExperimentIcon";
import ExperimentIconFilled from "@/components/ui/icons/ExperimentIconFilled";
import MembershipCardIcon from "@/components/ui/icons/MembershipCardIcon";
import MembershipCardIconFilled from "@/components/ui/icons/MembershipCardIconFilled";
import PeopleIcon from "@/components/ui/icons/PeopleIcon";
import PeopleIconFilled from "@/components/ui/icons/PeopleIconFilled";
import SidebarIconsLayout, { IconDto } from "@/components/ui/layouts/SidebarIconsLayout";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import UrlUtils from "@/lib/utils/UrlUtils";
import { CreditTypes } from "@/modules/credits/dtos/CreditType";
import { useParams } from "next/navigation";
import React from "react";

export default function ({ data, children }: { data: AppSettingsLayoutLoaderData; children: React.ReactNode }) {
  const { t } = useTranslation();
  const appData = useAppData();
  const params = useParams();

  const getTabs = () => {
    const tabs: IconDto[] = [];
    tabs.push({
      name: t("settings.profile.profileTitle"),
      href: UrlUtils.currentTenantUrl(params, "settings/profile"),
      icon: <CustomerIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
      iconSelected: <CustomerIconFilled className="h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
    });
    if (getUserHasPermission(appData, "app.settings.members.view")) {
      tabs.push({
        name: t("settings.members.title"),
        href: UrlUtils.currentTenantUrl(params, "settings/members"),
        icon: <PeopleIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <PeopleIconFilled className="h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    if (getUserHasPermission(appData, "app.settings.subscription.view")) {
      tabs.push({
        name: t("settings.subscription.title"),
        href: UrlUtils.currentTenantUrl(params, `settings/subscription`),
        icon: <MembershipCardIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <MembershipCardIconFilled className="h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
      if (CreditTypes.length > 0) {
        tabs.push({
          name: t("models.credit.plural"),
          href: UrlUtils.currentTenantUrl(params, "settings/credits"),
          icon: <CreditsIcon className="h-5 w-5" />,
          iconSelected: <CreditsIconFilled className="h-5 w-5" />,
        });
      }
    }
    if (getUserHasPermission(appData, "app.settings.account.view")) {
      tabs.push({
        name: t("settings.tenant.title"),
        href: UrlUtils.currentTenantUrl(params, "settings/account"),
        exact: true,
        icon: <CompanyIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <CompanyIconFilled className="h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    if (!data.isProduction && appData.isSuperAdmin) {
      tabs.push({
        name: "Dev",
        href: UrlUtils.currentTenantUrl(params, "settings/dev"),
        icon: <ExperimentIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <ExperimentIconFilled className="h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    return tabs;
  };

  return (
    <SidebarIconsLayout label={{ align: "right" }} items={getTabs()}>
      {children}
    </SidebarIconsLayout>
  );
}
