import { SubscriptionFeatureLimitType } from "@/modules/subscriptions/enums/SubscriptionFeatureLimitType";

export interface SubscriptionFeatureDto {
  order: number;
  title: string;
  name: string;
  type: SubscriptionFeatureLimitType;
  value: number;
  href?: string | null;
  badge?: string | null;
  accumulate?: boolean;
}
