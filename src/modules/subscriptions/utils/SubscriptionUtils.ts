import { TFunction } from 'i18next'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'

function getBillingPeriodDescription(t: TFunction, billing_period: SubscriptionBillingPeriod) {
  return t('pricing.' + SubscriptionBillingPeriod[billing_period].toString()).toString()
}

export default {
  getBillingPeriodDescription,
}
