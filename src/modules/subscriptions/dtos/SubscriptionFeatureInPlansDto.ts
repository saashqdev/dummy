import { SubscriptionFeatureLimitType } from "@/modules/subscriptions/enums/SubscriptionFeatureLimitType";

export interface SubscriptionFeatureInPlansDto {
  id: string;
  order: number;
  name: string;
  href?: string | null;
  badge?: string | null;
  accumulate?: boolean;
  plans: {
    id: string;
    title: string;
    type: SubscriptionFeatureLimitType;
    value: number;
  }[];
}
