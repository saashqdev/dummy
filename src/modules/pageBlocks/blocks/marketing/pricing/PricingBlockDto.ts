import Stripe from 'stripe'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'

export type PricingBlockDto = {
  style: PricingBlockStyle
  allowCoupons?: boolean
  contactUs?: PricingContactUsDto
  headline?: string
  subheadline?: string
  position?: 'left' | 'center' | 'right'
  data: PricingBlockData | null
}

export type PricingBlockData = {
  items: SubscriptionProductDto[]
  coupon: { error?: string; stripeCoupon?: Stripe.Coupon | null } | undefined
  currenciesAndPeriod: {
    currencies: { value: string; options: string[] }
    billing_periods: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] }
  }
}

export type PricingContactUsDto = {
  title: string
  description: string
  features: string[]
}

export const PricingBlockStyles = [{ value: 'simple', name: 'Simple' }] as const
export type PricingBlockStyle = (typeof PricingBlockStyles)[number]['value']
