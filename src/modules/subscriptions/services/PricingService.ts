import { SubscriptionFeatureDto } from '@/modules/subscriptions/dtos/SubscriptionFeatureDto'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import { SubscriptionPriceType } from '@/modules/subscriptions/enums/SubscriptionPriceType'
import { SubscriptionProductDto } from '../dtos/SubscriptionProductDto'
import { stripeService } from './StripeService'
import Stripe from 'stripe'
import { updateTenantSubscription } from './TenantSubscriptionService'
import { getTenant } from '@/modules/accounts/services/TenantService'
import { SubscriptionUsageBasedPriceDto } from '@/modules/subscriptions/dtos/SubscriptionUsageBasedPriceDto'
import { TFunction } from 'i18next'
import { SubscriptionPriceDto } from '@/modules/subscriptions/dtos/SubscriptionPriceDto'
import { clearSubscriptionsCache } from './SubscriptionService'
import currencies from '@/modules/subscriptions/data/currencies'
import { getOrPersistTenantSubscription } from './TenantSubscriptionService'
import { db } from '@/db'
import {
  CheckoutSessionStatusModel,
  SubscriptionPriceModel,
  SubscriptionUsageBasedPriceModel,
} from '@/db/models'

export async function createPlans(plans: SubscriptionProductDto[]) {
  let idx = 0
  for (const plan of plans.sort((a, b) => a.order - b.order)) {
    // wait 5 seconds between each plan creation
    await createPlan(
      plan,
      plan.prices.map((price) => {
        return {
          billing_period: price.billing_period,
          currency: price.currency,
          price: Number(price.price),
        }
      }),
      plan.features,
      plan.usageBasedPrices,
    )
    idx++
    if (idx < plans.length) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

export async function createPlan(
  plan: SubscriptionProductDto,
  prices: {
    billing_period: SubscriptionBillingPeriod
    price: number
    currency: string
    trial_days?: number
  }[],
  features: SubscriptionFeatureDto[],
  usageBasedPrices?: SubscriptionUsageBasedPriceDto[],
  t?: TFunction,
) {
  // Create stripe product
  const stripeProduct = await stripeService.createStripeProduct({
    title: plan.translatedTitle ?? plan.title,
  })
  // Save to db
  const productId = await db.subscription_product.createSubscriptionProduct({
    stripe_id: stripeProduct?.id ?? '',
    order: plan.order,
    title: plan.title,
    model: plan.model,
    description: plan.description,
    badge: plan.badge,
    group_title: plan.group_title || null,
    group_description: plan.group_description || null,
    active: plan.active,
    public: plan.public,
    billing_address_collection: plan.billing_address_collection ?? 'auto',
    has_quantity: plan.has_quantity ?? false,
    can_buy_again: plan.can_buy_again ?? false,
  })
  const product = await db.subscription_product.getSubscriptionProduct(productId)

  if (!product) {
    throw new Error('Could not create subscription product')
  }

  await Promise.all(
    prices.map(async (price) => {
      // Create stripe price
      const stripePrice = await stripeService.createStripePrice(stripeProduct?.id ?? '', price)
      // Save to db
      return await db.subscription_product.createSubscriptionPrice({
        ...price,
        subscription_product_id: product.id!,
        stripe_id: stripePrice?.id ?? '',
        type: SubscriptionPriceType.RECURRING,
        billing_period: price.billing_period,
        price: price.price,
        currency: price.currency,
        trial_days: price.trial_days ?? 0,
        active: true,
      })
    }),
  )

  await Promise.all(
    features
      .sort((a, b) => a.order - b.order)
      .map(async (feature) => {
        // Save to db
        return await db.subscriptionFeature.create(product.id!, feature)
      }),
  )

  if (usageBasedPrices) {
    await Promise.all(
      usageBasedPrices.map(async (usageBasedPrice) => {
        // eslint-disable-next-line no-console
        console.log('CREATING USAGE BASED PRICE', usageBasedPrice)
        const stripePrice = await stripeService.createStripeUsageBasedPrice(
          stripeProduct?.id ?? '',
          {
            ...usageBasedPrice,
            unit_title: t ? t(usageBasedPrice.unit_title) : usageBasedPrice.unit_title,
          },
        )
        const createdPriceId = await db.subscription_product.createSubscriptionUsageBasedPrice({
          subscription_product_id: product.id!,
          stripe_id: stripePrice?.id ?? '',
          billing_period: usageBasedPrice.billing_period,
          currency: usageBasedPrice.currency,
          unit: usageBasedPrice.unit,
          unit_title: usageBasedPrice.unit_title,
          unit_title_plural: usageBasedPrice.unit_title_plural,
          usage_type: usageBasedPrice.usage_type,
          aggregate_usage: usageBasedPrice.aggregate_usage,
          tiers_mode: usageBasedPrice.tiers_mode,
          billing_scheme: usageBasedPrice.billing_scheme,
        })
        const createdPrice =
          await db.subscription_product.getSubscriptionUsageBasedPrice(createdPriceId)
        if (!createdPrice) {
          throw new Error('Could not create usage based price')
        }
        await Promise.all(
          usageBasedPrice.tiers.map(async (tierPrice) => {
            await db.subscription_product.createSubscriptionUsageBasedTier({
              subscription_usage_based_price_id: createdPrice.id,
              from: tierPrice.from,
              to: tierPrice.to !== null && tierPrice.to !== undefined ? Number(tierPrice.to) : null,
              per_unit_price:
                tierPrice.per_unit_price !== null && tierPrice.per_unit_price !== undefined
                  ? tierPrice.per_unit_price
                  : null,
              flat_fee_price:
                tierPrice.flat_fee_price !== null && tierPrice.flat_fee_price !== undefined
                  ? tierPrice.flat_fee_price
                  : null,
            })
          }),
        )
      }),
    )
  }
}

export async function syncPlan(
  plan: SubscriptionProductDto,
  prices: {
    id?: string
    billing_period: SubscriptionBillingPeriod
    price: number
    currency: string
  }[],
) {
  if (!plan.id) {
    throw new Error(`Plan ${plan.title} not found on database`)
  }
  const stripeProduct = await stripeService.createStripeProduct({
    title: plan.translatedTitle ?? plan.title,
  })
  if (!stripeProduct) {
    throw new Error('Could not create product')
  }
  await db.subscription_product.updateSubscriptionProductStripeId(plan.id, {
    stripe_id: stripeProduct.id,
  })

  prices.map(async (price) => {
    // Create stripe price
    const stripePrice = await stripeService.createStripePrice(stripeProduct?.id ?? '', price)
    if (!stripePrice) {
      throw new Error(`Could not create price ${plan.title} - ${price.price}`)
    }
    // Save to db
    await db.subscription_product.updateSubscriptionPriceStripeId(price.id ?? '', {
      stripe_id: stripePrice?.id ?? '',
    })
  })
}

export async function updatePlan(plan: SubscriptionProductDto, features: SubscriptionFeatureDto[]) {
  if (!plan.id) {
    throw new Error(`Plan ${plan.title} not found on database`)
  }

  await stripeService.updateStripeProduct(plan.stripe_id, {
    title: plan.translatedTitle ?? plan.title,
  })

  await db.subscription_product.updateSubscriptionProduct(plan.id, {
    order: plan.order,
    title: plan.title,
    model: plan.model,
    description: plan.description ?? undefined,
    badge: plan.badge ?? undefined,
    group_title: plan.group_title ?? undefined,
    group_description: plan.group_description ?? undefined,
    public: plan.public,
    billing_address_collection: plan.billing_address_collection ?? 'auto',
    has_quantity: plan.has_quantity === undefined ? undefined : plan.has_quantity,
    can_buy_again: plan.can_buy_again === undefined ? undefined : plan.can_buy_again,
  })

  await db.subscriptionFeature.deleteBySubscriptionProductId(plan.id ?? '')
  await clearSubscriptionsCache()

  return await Promise.all(
    features
      .sort((a, b) => a.order - b.order)
      .map(async (feature) => {
        return await db.subscriptionFeature.create(plan.id ?? '', feature)
      }),
  )
}

export async function deletePlan(plan: SubscriptionProductDto) {
  await clearSubscriptionsCache()
  // eslint-disable-next-line no-console
  console.log(`Deleting ${plan.prices?.length} Flat-rate Prices`)

  await Promise.all(
    plan.prices
      .filter((f) => f.stripe_id)
      .map(async (price) => {
        await stripeService.archiveStripePrice(price.stripe_id)

        if (price.id) {
          await db.subscription_product.deleteSubscriptionPrice(price.id)
        }

        return null
      }),
  )

  // eslint-disable-next-line no-console
  console.log(`Deleting ${plan.usageBasedPrices?.length ?? 0} Usage-based Prices`)
  if (plan.usageBasedPrices) {
    await Promise.all(
      plan.usageBasedPrices?.map(async (price) => {
        await stripeService.archiveStripePrice(price.stripe_id)

        await Promise.all(
          price.tiers.map(async (tier) => {
            return db.subscription_product.deleteSubscriptionUsageBasedTier(tier.id)
          }),
        )
        await db.subscription_product.deleteSubscriptionUsageBasedPrice(price.id)

        return null
      }),
    )
  }

  // eslint-disable-next-line no-console
  console.log('Deleting Product with Stripe ID: ' + plan.stripe_id)
  if (plan.stripe_id) {
    try {
      await stripeService.deleteStripeProduct(plan.stripe_id)
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message)
      await stripeService.archiveStripeProduct(plan.stripe_id)
    }
  }

  if (plan.id) {
    await db.subscription_product.deleteSubscriptionProduct(plan.id)
  }
}

export type CheckoutSessionResponse = {
  id: string
  customer: {
    id: string
    email: string
    name: string
  }
  products: {
    id: string
    title: string
    quantity: number
    subscription: string | undefined
    prices: {
      flatPrice?: SubscriptionPriceModel
      usageBasedPrice?: SubscriptionUsageBasedPriceModel
      quantity?: number
    }[]
  }[]
  status: CheckoutSessionStatusModel | null
}
export async function getAcquiredItemsFromCheckoutSession(
  session_id: string | null,
): Promise<CheckoutSessionResponse | null> {
  const session = await stripeService.getStripeSession(session_id ?? '')
  if (!session || session.status !== 'complete') {
    return null
  }
  const prices: {
    flatPrice?: SubscriptionPriceModel
    usageBasedPrice?: SubscriptionUsageBasedPriceModel
    quantity?: number
  }[] = []
  try {
    let line_items: { price: Stripe.Price; quantity: number | undefined }[] = []
    if (session.line_items) {
      session.line_items.data.forEach((item) => {
        if (item.price) {
          line_items.push({
            price: item.price,
            quantity: item.quantity ?? undefined,
          })
        }
      })
    }

    await Promise.all(
      line_items.map(async (line_item) => {
        const flatPrice = await db.subscription_product.getSubscriptionPriceByStripeId(
          line_item.price.id,
        )
        const usageBasedPrice =
          await db.subscription_product.getSubscriptionUsageBasedPriceByStripeId(line_item.price.id)
        const quantity = line_item.quantity ?? undefined
        if (!flatPrice && !usageBasedPrice) {
          throw new Error('Price not found: ' + line_item.price.id)
        }
        prices.push({
          flatPrice: flatPrice ?? undefined,
          usageBasedPrice: usageBasedPrice ?? undefined,
          quantity,
        })
      }),
    )
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e.message)
  }

  const products: {
    id: string
    title: string
    quantity: number
    subscription: string | undefined
    prices: {
      flatPrice?: SubscriptionPriceModel
      usageBasedPrice?: SubscriptionUsageBasedPriceModel
      quantity?: number
    }[]
  }[] = []

  prices.forEach((item) => {
    const productId =
      item.flatPrice?.subscription_product_id ?? item.usageBasedPrice?.subscription_product_id ?? ''
    if (!productId) {
      return
    }
    const product = products.find((p) => p.id === productId)
    if (!product) {
      products.push({
        id: productId,
        title: '',
        quantity: item.quantity ?? 1,
        prices: [item],
        subscription: session.subscription?.toString(),
      })
    } else {
      product?.prices.push(item)
    }
  })

  await Promise.all(
    products.map(async (product) => {
      const subscription_product = await db.subscription_product.getSubscriptionProduct(product.id)
      product.title = subscription_product?.title ?? ''
    }),
  )

  const status = await db.checkoutSessionStatus.get(session.id)

  return {
    id: session.id,
    customer: {
      id: session.customer?.toString() ?? '',
      name: session.customer_details?.name ?? '',
      email: session.customer_details?.email ?? '',
    },
    products,
    status,
  }
}

export async function addTenantProductsFromCheckoutSession({
  tenantId,
  user,
  checkoutSession,
  createdUserId,
  createdTenantId,
  t,
}: {
  tenantId: string
  user: { id: string; email: string }
  checkoutSession: CheckoutSessionResponse
  createdUserId?: string | null
  createdTenantId?: string | null
  t: TFunction
}) {
  await clearSubscriptionsCache()
  const tenant = await getTenant(tenantId)
  if (!tenant) {
    throw new Error('Tenant not found')
  }
  const tenantSubscription = await getOrPersistTenantSubscription(tenant.id)
  if (!tenantSubscription.stripe_customer_id) {
    const customer = await stripeService.createStripeCustomer(user.email, tenant.name)
    if (customer) {
      tenantSubscription.stripe_customer_id = customer.id
      await updateTenantSubscription(tenant.id, {
        stripe_customer_id: customer.id,
      })
    }
  }
  const existingSessionStatus = await db.checkoutSessionStatus.get(checkoutSession.id)
  if (!checkoutSession) {
    throw new Error(t('settings.subscription.checkout.invalid'))
  } else if (checkoutSession.customer.id !== tenantSubscription.stripe_customer_id) {
    throw new Error(t('settings.subscription.checkout.invalidCustomer'))
  } else if (!existingSessionStatus) {
    throw new Error(t('settings.subscription.checkout.invalid'))
  } else if (!existingSessionStatus.pending) {
    throw new Error(t('settings.subscription.checkout.alreadyProcessed'))
  } else {
    await db.checkoutSessionStatus.update(checkoutSession.id, {
      pending: false,
      createdUserId,
      createdTenantId,
    })
    await Promise.all(
      checkoutSession.products.map(async (product) => {
        await db.tenantSubscriptionProduct.create({
          tenant_subscription_id: tenantSubscription.id,
          subscription_product_id: product.id ?? '',
          quantity: product.quantity,
          stripe_subscription_id: product.subscription ?? '',
          from_checkout_session_id: checkoutSession.id,
          prices: product.prices.map((price) => {
            return {
              subscription_price_id: price.flatPrice?.id,
              subscription_usage_based_price_id: price.usageBasedPrice?.id,
            }
          }),
        })
        const subscription_product = await db.subscription_product.getSubscriptionProduct(
          product.id,
        )
        // eslint-disable-next-line no-console
        console.log('[addTenantProductsFromCheckoutSession] Subscription product', {
          subscription_product,
        })
      }),
    )
  }
}

export async function autosubscribeToTrialOrFreePlan({ tenantId }: { tenantId: string }) {
  // eslint-disable-next-line no-console
  console.log('[autosubscribeToTrialOrFreePlan] Starting')
  const tenant = await getTenant(tenantId)
  if (!tenant) {
    // eslint-disable-next-line no-console
    console.log('[autosubscribeToTrialOrFreePlan] No tenant')
    return
  }
  if (!tenant.subscription?.stripe_customer_id) {
    // eslint-disable-next-line no-console
    console.log('[autosubscribeToTrialOrFreePlan] No stripe customer id')
    return
  }
  const defaultCurrency = currencies.find((f) => f.default)?.value
  if (!defaultCurrency) {
    return
  }
  const allProducts = await db.subscription_product.getAllSubscriptionProducts(true)
  const productsFree: SubscriptionPriceDto[] = []
  const productsWithTrialDays: SubscriptionPriceDto[] = []

  // eslint-disable-next-line no-console
  console.log('[autosubscribeToTrialOrFreePlan] All products', {
    allProducts: allProducts.map((f) => f.title),
  })

  allProducts.forEach((product) => {
    if (product.prices.length === 0) {
      return
    }
    const allPricesAreZero = product.prices.every(
      (price) =>
        price.currency === defaultCurrency &&
        (price.price === undefined || Number(price.price) === 0),
    )
    if (allPricesAreZero) {
      productsFree.push(product.prices[0])
    }
    const firstPriceWithTrialDays = product.prices.find(
      (price) =>
        price.currency === defaultCurrency &&
        (price.trial_days > 0 || price.price === undefined || Number(price.price) === 0),
    )
    if (firstPriceWithTrialDays) {
      productsWithTrialDays.push(firstPriceWithTrialDays)
    }
  })

  try {
    if (productsWithTrialDays.length > 0) {
      // eslint-disable-next-line no-console
      console.log('[autosubscribeToTrialOrFreePlan] Products with trial days', {
        productsWithTrialDays,
      })
      const price = productsWithTrialDays[0]
      // eslint-disable-next-line no-console
      console.log({ price })
      const trial_end = Math.floor(Date.now() / 1000) + (price.trial_days || 30) * 24 * 60 * 60
      const stripeSubscription = await stripeService.createStripeSubscription(
        tenant.subscription.stripe_customer_id,
        price.stripe_id,
        trial_end,
      )
      await db.tenantSubscriptionProduct.create({
        tenant_subscription_id: tenant.subscription.id,
        subscription_product_id: price.subscription_product_id,
        quantity: 1,
        stripe_subscription_id: stripeSubscription.id,
        from_checkout_session_id: null,
        prices: [
          {
            subscription_price_id: price.id,
          },
        ],
      })
    } else if (productsFree.length > 0) {
      // TODO: IMPLEMENT
      // eslint-disable-next-line no-console
      console.log('[autosubscribeToTrialOrFreePlan] Products free', { productsFree })
    } else {
      // eslint-disable-next-line no-console
      console.log('[autosubscribeToTrialOrFreePlan] No auto-subscription products/plans found')
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[autosubscribeToTrialOrFreePlan] Error', e.message)
  }
}
