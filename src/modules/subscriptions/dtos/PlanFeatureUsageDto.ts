import { SubscriptionFeatureLimitType } from "@/modules/subscriptions/enums/SubscriptionFeatureLimitType";

export interface PlanFeatureUsageDto {
  order: number;
  title: string;
  name: string;
  type: SubscriptionFeatureLimitType;
  value: number;
  used: number;
  remaining: number | "unlimited";
  enabled: boolean;
  message: string;
  period?: {
    firstDay: Date | null;
    lastDay: Date | null;
  };
}
