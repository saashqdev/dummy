import Stripe from 'stripe'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import { SubscriptionUsageBasedPriceDto } from '@/modules/subscriptions/dtos/SubscriptionUsageBasedPriceDto'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import { getCurrentUrl } from '@/lib/services/url.server'

class StripeService {
  stripe: Stripe
  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2022-08-01',
    })
  }

  async createStripeCheckoutSession(data: {
    subscription_product: SubscriptionProductDto
    customer?: string
    line_items: { price: string; quantity?: number }[]
    mode: 'payment' | 'setup' | 'subscription'
    success_url: string
    cancel_url: string
    freeTrialDays?: number
    coupon?: string
    promo_code?: string
    referral?: string | null
  }) {
    const discounts: { coupon?: string; promotion_code?: string }[] = []
    if (data.coupon) {
      discounts.push({ coupon: data.coupon })
    } else if (data.promo_code) {
      discounts.push({ promotion_code: data.promo_code })
    }
    let billing_address_collection: 'auto' | 'required' | undefined = undefined
    if (data.subscription_product.billing_address_collection === 'required') {
      billing_address_collection = 'required'
    } else if (data.subscription_product.billing_address_collection === 'auto') {
      billing_address_collection = 'auto'
    }
    let client_reference_id: string | undefined = undefined
    if (data.referral) {
      client_reference_id = data.referral
    }
    return await this.stripe.checkout.sessions
      .create({
        discounts,
        customer: data.customer,
        line_items: data.line_items,
        mode: data.mode,
        success_url: data.success_url,
        cancel_url: data.cancel_url,
        customer_creation: data.mode === 'payment' && !data.customer ? 'always' : undefined,
        payment_method_collection: data.mode === 'subscription' ? 'if_required' : undefined,
        subscription_data: {
          trial_period_days: data.freeTrialDays,
        },
        billing_address_collection,
        client_reference_id,
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e)
        throw e
      })
  }

  async createStripeSetupSession(customer: string) {
    return await this.stripe.checkout.sessions.create({
      customer,
      success_url: `${await getCurrentUrl()}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${await getCurrentUrl()}`,
      mode: 'setup',
      payment_method_types: ['card'],
    })
  }

  async deleteStripePaymentMethod(id: string) {
    return await this.stripe.paymentMethods.detach(id)
  }

  async getStripeSession(id: string) {
    return await this.stripe.checkout.sessions
      .retrieve(id, {
        expand: ['line_items'],
      })
      .catch(() => {
        return null
      })
  }

  async cancelStripeSubscription(subscriptionId: string) {
    return await this.stripe.subscriptions.del(subscriptionId).catch((e: any) => {
      // eslint-disable-next-line no-console
      console.log('Could not cancel stripe subscription', e.message)
    })
  }

  async getStripeSubscription(id: string) {
    try {
      return await this.stripe.subscriptions.retrieve(id)
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Could not get stripe subscription', e.message)
      return null
    }
  }

  async createStripeSubscription(customer: string, price: string, trial_end?: number) {
    return await this.stripe.subscriptions.create({
      customer,
      items: [
        {
          price,
        },
      ],
      trial_end,
    })
  }

  async getStripeInvoices(id: string | null) {
    if (!id) {
      return []
    }
    try {
      return (
        await this.stripe.invoices.list({
          customer: id,
        })
      ).data
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Could not get stripe invoices', e.message)
      return []
    }
  }

  async getStripePaymentIntents(id: string | null, status?: Stripe.PaymentIntent.Status) {
    if (!id) {
      return []
    }
    try {
      let items = (
        await this.stripe.paymentIntents.list({
          customer: id,
        })
      ).data
      if (status) {
        items = items.filter((item) => item.status === status)
      }
      return items
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Could not get stripe payment intents', e.message)
      return []
    }
  }

  async getStripeUpcomingInvoice(id: string | null) {
    if (!id) {
      return null
    }
    try {
      return await this.stripe.invoices.retrieveUpcoming({
        customer: id,
      })
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Could not get stripe upcoming invoice', e.message)
      return null
    }
  }

  async getStripePaymentMethods(customer: string | null) {
    if (!customer) {
      return []
    }
    try {
      return (
        await this.stripe.paymentMethods.list({
          customer,
          type: 'card',
        })
      ).data
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Could not get stripe payment methods', e.message)
      return []
    }
  }

  async createStripeCustomer(email: string, name: string) {
    return await this.stripe.customers
      .create({
        email,
        name,
      })
      .catch((e: any) => {
        // eslint-disable-next-line no-console
        console.error(e.message)
        return null
      })
  }

  async deleteStripeCustomer(id: string) {
    return await this.stripe.customers.del(id).catch((e: any) => {
      // eslint-disable-next-line no-console
      console.log('Could not delete stripe customer', e.message)
    })
  }

  async createStripeProduct(data: { title: string }) {
    return await this.stripe.products.create({
      name: data.title,
    })
  }

  async updateStripeProduct(id: string, data: { title: string }) {
    return await this.stripe.products
      .update(id, {
        name: data.title,
      })
      .catch((e: any) => {
        // eslint-disable-next-line no-console
        console.error(e.message)
      })
  }

  async createStripePrice(
    productId: string,
    data: {
      billing_period: SubscriptionBillingPeriod
      price: number
      currency: string
      trial_days?: number
    },
  ) {
    if (!productId) {
      return undefined
    }
    let recurring:
      | {
          interval: 'day' | 'week' | 'month' | 'year'
          trial_period_days: number | undefined
          interval_count?: number
        }
      | undefined = undefined
    switch (data.billing_period) {
      case SubscriptionBillingPeriod.MONTHLY:
        recurring = { interval: 'month', trial_period_days: data.trial_days }
        break
      case SubscriptionBillingPeriod.QUARTERLY:
        recurring = { interval: 'month', interval_count: 3, trial_period_days: data.trial_days }
        break
      case SubscriptionBillingPeriod.SEMI_ANNUAL:
        recurring = { interval: 'month', interval_count: 6, trial_period_days: data.trial_days }
        break
      case SubscriptionBillingPeriod.WEEKLY:
        recurring = { interval: 'week', trial_period_days: data.trial_days }
        break
      case SubscriptionBillingPeriod.YEARLY:
        recurring = { interval: 'year', trial_period_days: data.trial_days }
        break
      case SubscriptionBillingPeriod.DAILY:
        recurring = { interval: 'day', trial_period_days: data.trial_days }
        break
    }
    return await this.stripe.prices.create({
      unit_amount: Math.round(data.price * 100),
      currency: data.currency,
      recurring,
      product: productId,
      active: true,
    })
  }

  async createStripeUsageBasedPrice(productId: string, data: SubscriptionUsageBasedPriceDto) {
    if (!productId) {
      return undefined
    }
    let interval: 'day' | 'week' | 'month' | 'year' = 'month'
    let interval_count: number | undefined = undefined
    switch (data.billing_period) {
      case SubscriptionBillingPeriod.MONTHLY:
        interval = 'month'
        break
      case SubscriptionBillingPeriod.QUARTERLY:
        interval = 'month'
        interval_count = 3
        break
      case SubscriptionBillingPeriod.SEMI_ANNUAL:
        interval = 'month'
        interval_count = 6
        break
      case SubscriptionBillingPeriod.WEEKLY:
        interval = 'week'
        break
      case SubscriptionBillingPeriod.YEARLY:
        interval = 'year'
        break
      case SubscriptionBillingPeriod.DAILY:
        interval = 'day'
        break
    }
    const usage_type: 'licensed' | 'metered' =
      data.usage_type === 'licensed' ? 'licensed' : 'metered'
    const tiers_mode: 'graduated' | 'volume' =
      data.tiers_mode === 'graduated' ? 'graduated' : 'volume'
    const billing_scheme: 'per_unit' | 'tiered' =
      data.billing_scheme === 'per_unit' ? 'per_unit' : 'tiered'
    let aggregate_usage: 'last_during_period' | 'last_ever' | 'max' | 'sum' = 'sum'
    if (data.aggregate_usage === 'last_during_period') {
      aggregate_usage = 'last_during_period'
    } else if (data.aggregate_usage === 'last_ever') {
      aggregate_usage = 'last_ever'
    } else if (data.aggregate_usage === 'max') {
      aggregate_usage = 'max'
    }

    const tiers: {
      up_to: 'inf' | number
      unit_amount_decimal?: string
      flat_amount_decimal?: string
    }[] = data.tiers
      .sort((x, y) => {
        if (x.to && y.to) {
          return x.to > y.to ? 1 : -1
        }
        return 1
      })
      .map((tier) => {
        let up_to: 'inf' | number = Number(tier.to)
        if (tier.to === undefined || tier.to === null) {
          up_to = 'inf'
        }
        return {
          up_to,
          unit_amount_decimal:
            tier.per_unit_price !== undefined
              ? (Number(tier.per_unit_price) * 100)?.toString()
              : undefined,
          flat_amount_decimal:
            tier.flat_fee_price !== undefined
              ? (Number(tier.flat_fee_price) * 100)?.toString()
              : undefined,
        }
      })

    return await this.stripe.prices.create({
      currency: data.currency,
      tiers_mode,
      billing_scheme,
      nickname: data.unit_title,
      recurring: { interval, interval_count, usage_type, aggregate_usage },
      product: productId,
      tiers,
      active: true,
      expand: ['tiers'],
    })
  }

  async deleteStripeProduct(productId: string) {
    return await this.stripe.products.del(productId)
  }

  async archiveStripeProduct(productId: string) {
    return await this.stripe.products
      .update(productId, {
        active: false,
      })
      .catch(() => {
        // ignore
      })
  }

  async archiveStripePrice(productId: string) {
    return await this.stripe.prices
      .update(productId, {
        active: false,
      })
      .catch(() => {
        // ignore
      })
  }

  async createUsageRecord(
    id: string,
    quantity: number,
    action: 'increment' | 'set',
    timestamp: number | 'now' = 'now',
  ) {
    return await this.stripe.subscriptionItems
      .createUsageRecord(id, {
        quantity,
        action,
        timestamp,
      })
      .catch(() => {
        // ignore
        return null
      })
  }

  async getStripeCoupon(id: string) {
    return await this.stripe.coupons.retrieve(id, {
      expand: ['applies_to'],
    })
  }

  async getStripeCustomer(id: string | null) {
    if (!id) {
      return null
    }
    return await this.stripe.customers.retrieve(id, {
      expand: ['invoice_settings'],
    })
  }

  async createCustomerPortalSession(id: string) {
    return await this.stripe.billingPortal.sessions.create({
      customer: id,
      return_url: `${await getCurrentUrl()}`,
    })
  }
}

export const stripeService = new StripeService(process.env.STRIPE_SK || '')
