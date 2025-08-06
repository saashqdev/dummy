import { SubscriptionBillingPeriod } from "@/modules/subscriptions/enums/SubscriptionBillingPeriod";

export interface BillingPeriodDto {
  value: SubscriptionBillingPeriod;
  default?: boolean;
  disabled?: boolean;
  recurring: boolean;
}
