import { BillingPeriodDto } from '../dtos/BillingPeriodDto'
import { SubscriptionBillingPeriod } from '../enums/SubscriptionBillingPeriod'

const billing_periods: BillingPeriodDto[] = [
  {
    value: SubscriptionBillingPeriod.MONTHLY,
    default: true,
    recurring: true,
  },
  {
    value: SubscriptionBillingPeriod.YEARLY,
    recurring: true,
  },
  {
    value: SubscriptionBillingPeriod.ONCE,
    recurring: false,
  },
  {
    value: SubscriptionBillingPeriod.DAILY,
    disabled: true,
    recurring: true,
  },
  {
    value: SubscriptionBillingPeriod.WEEKLY,
    disabled: true,
    recurring: true,
  },
]
export default billing_periods
