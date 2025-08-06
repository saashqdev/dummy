"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import { PlanFeatureUsageDto } from "@/modules/subscriptions/dtos/PlanFeatureUsageDto";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import UrlUtils from "@/lib/utils/UrlUtils";
import { useTranslation } from "react-i18next";

interface Props {
  item: PlanFeatureUsageDto | undefined;
  children: ReactNode;
  hideContent?: boolean;
}
export default function CheckPlanFeatureLimit({ item, children, hideContent = true }: Props) {
  const params = useParams();
  const { t } = useTranslation();
  return (
    <div>
      {item && !item.enabled ? (
        <div className="space-y-2">
          <WarningBanner redirect={UrlUtils.currentTenantUrl(params, `settings/subscription`)} title={item.name.toUpperCase()} text={``}>
            <div className="mt-2">
              <span>{t(item.message)}</span>
            </div>
          </WarningBanner>

          {!hideContent && children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
