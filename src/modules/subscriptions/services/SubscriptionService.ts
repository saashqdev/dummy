import { DefaultAppFeatures } from '@/modules/subscriptions/data/appFeatures'
import { PlanFeatureUsageDto } from '@/modules/subscriptions/dtos/PlanFeatureUsageDto'
import { SubscriptionFeatureDto } from '@/modules/subscriptions/dtos/SubscriptionFeatureDto'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import { SubscriptionFeatureLimitType } from '@/modules/subscriptions/enums/SubscriptionFeatureLimitType'
import currencies from '@/modules/subscriptions/data/currencies'
import { stripeService } from './StripeService'
import { getAcquiredItemsFromCheckoutSession } from './PricingService'
import { cachified, clearCacheKey } from '@/lib/services/cache.server'
import DateUtils from '@/lib/utils/DateUtils'
import { PricingModel } from '../enums/PricingModel'
import { SubscriptionPriceDto } from '../dtos/SubscriptionPriceDto'
import {
  SubscriptionFeatureModel,
  SubscriptionPriceModel,
  TenantSubscriptionWithDetailsDto,
} from '@/db/models'
import { db } from '@/db'

export async function getPlanFeaturesUsage(
  tenantId: string,
  tenantSubscription?: TenantSubscriptionWithDetailsDto | null,
): Promise<PlanFeatureUsageDto[]> {
  let subscription: TenantSubscriptionWithDetailsDto | null = null
  if (tenantSubscription === undefined) {
    subscription = await getActiveTenantSubscriptions(tenantId)
  } else {
    subscription = tenantSubscription
  }
  const myUsage: PlanFeatureUsageDto[] = []
  let allFeatures: SubscriptionFeatureDto[] = []
  const features: SubscriptionFeatureModel[] = await db.subscriptionFeature.getAll()
  features
    .filter((f) => f.name)
    .forEach((feature) => {
      const existing = allFeatures.find((f) => f.name === feature.name)
      if (!existing) {
        allFeatures.push({
          order: feature.order,
          name: feature.name,
          title: feature.title,
          type: feature.type,
          value: feature.value,
          accumulate: feature.accumulate,
        })
      }
    })
  allFeatures = allFeatures.sort((a, b) => a.order - b.order)

  await Promise.all(
    allFeatures.map(async (item) => {
      let myFeatures: SubscriptionFeatureDto[] = []
      subscription?.products.forEach((product) => {
        const feature = product.subscription_product.features.find((f) => f.name === item.name)
        if (feature) {
          if (!product.quantity) {
            myFeatures.push(feature)
          } else {
            // per-seat or one-time multiplication
            for (let idx = 0; idx < product.quantity; idx++) {
              myFeatures.push(feature)
            }
          }
        }
      })
      const existingSubscriptionFeature = mergeFeatures(myFeatures)
      const feature = existingSubscriptionFeature ?? item
      const usage: PlanFeatureUsageDto = {
        order: feature.order,
        title: feature.title,
        name: feature.name,
        type: feature.type,
        value: feature.value,
        used: 0,
        remaining: 0,
        enabled: feature.type !== SubscriptionFeatureLimitType.NOT_INCLUDED,
        message: '',
      }

      if (!existingSubscriptionFeature) {
        usage.type = SubscriptionFeatureLimitType.NOT_INCLUDED
        usage.enabled = false
        if (subscription?.products && subscription.products.length > 0) {
          usage.message = 'api.featureLimits.upgradeSubscription'
        } else {
          usage.message = 'api.featureLimits.noSubscription'
        }
      } else {
        if (feature.type === SubscriptionFeatureLimitType.NOT_INCLUDED) {
          usage.enabled = false
          usage.message = 'api.featureLimits.notIncluded'
        } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
          usage.used = await getUsed(tenantId, feature, subscription)
          usage.remaining = usage.value - usage.used
          if (usage.remaining <= 0) {
            usage.message = `You've reached the limit (${usage.used}/${usage.value})`
            usage.enabled = false
          }
        } else if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
          usage.used = await getUsed(tenantId, feature, subscription)
          usage.remaining = usage.value - usage.used
          usage.period = getUsedPeriod(subscription)
          if (usage.remaining <= 0) {
            usage.message = `You've reached the limit this month (${usage.used}/${usage.value})`
            usage.enabled = false
          }
        } else if (feature.type === SubscriptionFeatureLimitType.UNLIMITED) {
          usage.remaining = 'unlimited'
        }
      }
      myUsage.push(usage)
    }),
  )

  return myUsage.sort((a, b) => a.order - b.order)
}

function mergeFeatures(features: SubscriptionFeatureDto[]) {
  if (features.length === 0) {
    return undefined
  }
  const mergedFeature: SubscriptionFeatureDto = {
    order: features[0].order,
    title: features[0].title,
    name: features[0].name,
    type: SubscriptionFeatureLimitType.NOT_INCLUDED,
    value: 0,
    accumulate: features[0].accumulate,
  }

  let firstFeature = true
  features.forEach((feature) => {
    if (mergedFeature.type < feature.type) {
      mergedFeature.type = feature.type
    }
    // console.log({ mergedFeature });
    if (mergedFeature.accumulate || firstFeature) {
      mergedFeature.value += feature.value
    }

    firstFeature = false
  })

  return mergedFeature
}

export async function getPlanFeatureUsage(
  tenantId: string,
  featureName: string,
  tenantSubscription?: TenantSubscriptionWithDetailsDto | null,
): Promise<PlanFeatureUsageDto | undefined> {
  const usage = await getPlanFeaturesUsage(tenantId, tenantSubscription)
  return usage.find((f) => f.name === featureName)
}

function getUsedPeriod(subscription: TenantSubscriptionWithDetailsDto | null) {
  const date = new Date(),
    y = date.getFullYear(),
    m = date.getMonth()
  let firstDay = new Date(y, m, 1, 0, 0, 1)
  let lastDay = new Date(y, m + 1, 0, 23, 59, 59)

  subscription?.products.forEach((product) => {
    if (product.current_period_start && product.current_period_end) {
      firstDay = product.current_period_start
      lastDay = product.current_period_end
    }
  })

  return {
    firstDay,
    lastDay,
  }
}

async function getUsed(
  tenantId: string,
  feature: SubscriptionFeatureDto,
  subscription: TenantSubscriptionWithDetailsDto | null,
): Promise<number> {
  const { firstDay, lastDay } = await getUsedPeriod(subscription)
  if (feature.name === DefaultAppFeatures.Users) {
    if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
      return await db.tenantUser.countByCreatedAt(tenantId, {
        gte: firstDay,
        lt: lastDay,
      })
    } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
      return await db.tenantUser.count(tenantId)
    }
  } else if (feature.name === DefaultAppFeatures.Credits) {
    if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
      return await db.credit.sumAmount({
        tenantId,
        createdAt: { gte: firstDay, lt: lastDay },
      })
    } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
      return await db.credit.sumAmount({ tenantId })
    }
  }
  return 0
}

export async function getActiveTenantSubscriptions(tenantId: string) {
  const mySubscription = await cachified({
    key: `tenantSubscription:${tenantId}`,
    ttl: 1000 * 60 * 60, // 1 hour
    getFreshValue: () => db.tenantSubscription.get(tenantId),
  })
  if (mySubscription) {
    await Promise.all(
      mySubscription.products.map(async (item) => {
        if (item.stripe_subscription_id) {
          let currentPeriod =
            item.current_period_start && item.current_period_end
              ? {
                  start: DateUtils.getDateStartOfDay(item.current_period_start),
                  end: DateUtils.getDateEndOfDay(item.current_period_end),
                }
              : undefined
          const today = new Date()
          let todayIsInCurrentPeriod = false
          if (currentPeriod) {
            todayIsInCurrentPeriod =
              today >= item.current_period_start! && today <= item.current_period_end!
          }
          if (currentPeriod && todayIsInCurrentPeriod) {
            item.current_period_start = currentPeriod.start
            item.current_period_end = currentPeriod.end
          } else {
            const stripeSubscription = await stripeService.getStripeSubscription(
              item.stripe_subscription_id,
            )
            if (stripeSubscription) {
              let startOfDay = new Date(stripeSubscription.current_period_start * 1000)
              let endOfDay = new Date(stripeSubscription.current_period_end * 1000)
              item.current_period_start = DateUtils.getDateStartOfDay(startOfDay)
              item.current_period_end = DateUtils.getDateEndOfDay(endOfDay)
            }
            await db.tenantSubscriptionProduct
              .update(item.id, {
                current_period_start: item.current_period_start,
                current_period_end: item.current_period_end,
              })
              .then(() => {
                clearCacheKey(`tenantSubscription:${tenantId}`)
              })
          }
        }
      }),
    )
    mySubscription.products = mySubscription.products.filter(
      (f) => !f.ends_at || new Date(f.ends_at) > new Date(),
    )
  }
  return mySubscription
}

async function getActiveTenantsSubscriptions() {
  const subscriptions = await db.tenantSubscription.getAll()
  return await Promise.all(
    subscriptions.map(async (mySubscription) => {
      await Promise.all(
        mySubscription.products.map(async (item) => {
          if (item.stripe_subscription_id) {
            const stripeSubscription = await stripeService.getStripeSubscription(
              item.stripe_subscription_id,
            )
            if (stripeSubscription) {
              item.current_period_start = new Date(stripeSubscription.current_period_start * 1000)
              item.current_period_end = new Date(stripeSubscription.current_period_end * 1000)
            }
          }
        }),
      )
      mySubscription.products = mySubscription.products.filter(
        (f) => !f.ends_at || new Date(f.ends_at) > new Date(),
      )
      return mySubscription
    }),
  )
}

export async function reportUsage(tenantId: string, unit: string) {
  const tenantSubscription = await getActiveTenantSubscriptions(tenantId)
  if (!tenantSubscription) {
    return
  }
  await Promise.all(
    tenantSubscription.products.map(async (product) => {
      return await Promise.all(
        product.prices.map(async (price) => {
          if (!product.stripe_subscription_id) {
            return
          }
          if (price.subscription_usage_based_price?.unit === unit) {
            const stripeSubscription = await stripeService.getStripeSubscription(
              product.stripe_subscription_id,
            )
            const subscriptionItem = stripeSubscription?.items.data.find(
              (f) => f.price.id === price.subscription_usage_based_price?.stripe_id,
            )
            if (subscriptionItem) {
              // console.log("[REPORT USAGE] Will report usage for subscription item id", subscriptionItem);
              const usageRecord = await stripeService.createUsageRecord(
                subscriptionItem.id,
                1,
                'increment',
              )
              if (usageRecord) {
                await db.tenantSubscription.createUsageRecord({
                  tenant_subscription_product_price_id: price.id,
                  timestamp: usageRecord.timestamp,
                  quantity: usageRecord.quantity,
                  stripe_subscription_item_id: subscriptionItem.id,
                })
              }
            }
          }
        }),
      )
    }),
  )
}

export async function persistCheckoutSessionStatus({
  id,
  fromUrl,
  fromUserId,
  fromTenantId,
}: {
  id: string
  fromUrl: string
  fromUserId?: string | null
  fromTenantId?: string | null
}) {
  const existingCheckoutSession = await db.checkoutSessionStatus.get(id)
  if (!existingCheckoutSession) {
    const stripeCheckoutSession = await stripeService.getStripeSession(id)
    if (stripeCheckoutSession) {
      const sessionId = await db.checkoutSessionStatus.create({
        id: stripeCheckoutSession.id,
        email: stripeCheckoutSession.customer_details?.email ?? '',
        fromUrl,
        fromUserId,
        fromTenantId,
      })
      const session = await db.checkoutSessionStatus.get(sessionId)
      if (session && !session.fromUserId && !session.fromTenantId) {
        const sessionResponse = await getAcquiredItemsFromCheckoutSession(session.id)
        if (sessionResponse && sessionResponse.products.length > 0) {
          // await sendEmail({
          //   to: session.email,
          //   ...EmailTemplates.ACCOUNT_SETUP_EMAIL.parse({
          //     // plan: sessionResponse.products[0].title,
          //     appConfiguration,
          //     action_url: `${(await getBaseURL())}/pricing/${session.id}/success`,
          //   }),
          // });
        }
      }
    }
  }
}

export async function getMrr(currency: string) {
  const activeSubscriptions = await getActiveTenantsSubscriptions()
  let summary: { total: number; count: number } = {
    total: 0,
    count: 0,
  }
  activeSubscriptions.forEach((s) => {
    s.products.forEach((p) => {
      summary.count++
      p.prices.forEach((f) => {
        summary.total += getPriceInCurrency(f.subscription_price, currency)
      })
    })
  })
  return summary
}

function getPriceInCurrency(subscription_price: SubscriptionPriceModel | null, currency: string) {
  if (!subscription_price) {
    return 0
  }
  let total = 0
  if (subscription_price.billing_period === SubscriptionBillingPeriod.MONTHLY) {
    total = Number(subscription_price.price)
  } else if (subscription_price.billing_period === SubscriptionBillingPeriod.YEARLY) {
    total = Number(subscription_price.price) / 12
  } else if (subscription_price.billing_period === SubscriptionBillingPeriod.WEEKLY) {
    total = Number(subscription_price.price) * 4
  } else if (subscription_price.billing_period === SubscriptionBillingPeriod.DAILY) {
    total = Number(subscription_price.price) * 30
  }
  if (currency !== subscription_price.currency) {
    total = convertToCurrency({ from: subscription_price.currency, to: currency, price: total })
  }
  return total
}

function convertToCurrency({
  from,
  price,
  to,
}: {
  from: string
  price: number
  to: string
}): number {
  const fromCurrency = currencies.find((f) => f.value === from)
  const toCurrency = currencies.find((f) => f.value === to)
  if (!fromCurrency || !toCurrency) {
    return 0
  }
  const fromParity = fromCurrency.parities?.find((f) => f.from === to)
  const toParity = toCurrency.parities?.find((f) => f.from === from)
  if (fromParity && fromParity.parity !== 0) {
    return price / fromParity.parity
  } else if (toParity && toParity.parity !== 0) {
    return price / toParity.parity
  }
  return 0
}

export async function clearSubscriptionsCache() {
  const tenants = await db.tenant.getAllIdsAndNames()
  tenants.forEach((tenant) => {
    clearCacheKey(`tenantSubscription:${tenant.id}`)
  })
}

export async function getPlanFromForm(form: FormData) {
  const productId = form.get('product-id')?.toString() ?? ''
  const billing_period = Number(form.get('billing-period')) as SubscriptionBillingPeriod
  const currency = form.get('currency')?.toString() ?? ''
  const quantity = Number(form.get('quantity'))
  const coupon = form.get('coupon')?.toString()
  const isUpgrade = form.get('is-upgrade')?.toString() === 'true'
  const isDowngrade = form.get('is-downgrade')?.toString() === 'true'
  const referral = form.get('referral')?.toString() || null

  // eslint-disable-next-line no-console
  console.log('[Subscription]', {
    productId,
    billing_period: SubscriptionBillingPeriod[billing_period],
    currency,
    quantity,
    coupon,
    referral,
    isUpgrade,
    isDowngrade,
  })

  const product = await db.subscription_product.getSubscriptionProduct(productId)
  if (!product) {
    throw Error('Invalid product')
  }

  let flatPrice: SubscriptionPriceDto | undefined = undefined
  let freeTrialDays: number | undefined = undefined
  if (product.model === PricingModel.ONCE) {
    flatPrice = product.prices.find(
      (f) => f.currency === currency && f.billing_period === SubscriptionBillingPeriod.ONCE,
    )
  } else {
    flatPrice = product.prices.find(
      (f) => f.currency === currency && f.billing_period === billing_period,
    )
  }
  const usageBasedPrices = product?.usageBasedPrices?.filter((f) => f.currency === currency)

  if (!flatPrice && usageBasedPrices?.length === 0) {
    throw Error('Invalid price')
  }
  let mode: 'payment' | 'setup' | 'subscription' = 'subscription'
  const line_items: { price: string; quantity?: number }[] = []
  if (product.model === PricingModel.ONCE) {
    mode = 'payment'
  }

  if (flatPrice) {
    line_items.push({ price: flatPrice.stripe_id, quantity })
    if (flatPrice.trial_days > 0) {
      freeTrialDays = flatPrice.trial_days
    }
  }
  usageBasedPrices?.forEach((usageBasedPrice) => {
    line_items.push({ price: usageBasedPrice.stripe_id })
  })

  return {
    mode,
    line_items,
    product,
    flatPrice,
    usageBasedPrices,
    freeTrialDays,
    coupon,
    isUpgrade,
    isDowngrade,
    referral,
  }
}
