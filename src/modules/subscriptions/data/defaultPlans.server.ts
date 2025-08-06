import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import { SubscriptionPriceType } from '@/modules/subscriptions/enums/SubscriptionPriceType'
import { DefaultAppFeatures } from './appFeatures'
import { SubscriptionPriceDto } from '../dtos/SubscriptionPriceDto'
import { SubscriptionProductDto } from '../dtos/SubscriptionProductDto'
import { SubscriptionUsageBasedPriceDto } from '../dtos/SubscriptionUsageBasedPriceDto'
import { SubscriptionUsageBasedTierDto } from '../dtos/SubscriptionUsageBasedTierDto'
import { PricingModel } from '../enums/PricingModel'
import { SubscriptionFeatureLimitType } from '../enums/SubscriptionFeatureLimitType'
import { UNIT_CREDIT } from './usageBasedUnits'

function generatePrice(
  currency: string,
  price: number,
  billing_period: SubscriptionBillingPeriod,
): SubscriptionPriceDto {
  return {
    stripe_id: '',
    subscription_product_id: '',
    type:
      billing_period === SubscriptionBillingPeriod.ONCE
        ? SubscriptionPriceType.ONE_TIME
        : SubscriptionPriceType.RECURRING,
    billing_period,
    price: Math.round(price * 100) / 100,
    currency,
    trial_days: 0,
    active: true,
    usageBasedPrices: [],
  }
}

function generateUsageBasedPrice(
  currency: string,
  unit: {
    name: string
    title: string
    titlePlural: string
  },
  usage_type: 'licensed' | 'metered',
  aggregate_usage: 'last_during_period' | 'last_ever' | 'max' | 'sum',
  tiers_mode: 'graduated' | 'volume',
  billing_scheme: 'per_unit' | 'tiered',
  tiers: {
    from: number
    to: undefined | number
    per_unit_price: number | undefined
    flat_fee_price: number | undefined
  }[],
): SubscriptionUsageBasedPriceDto {
  const usageBasedPriceTiers: SubscriptionUsageBasedTierDto[] = []
  tiers.forEach((tier) => {
    usageBasedPriceTiers.push({
      id: '',
      subscription_usage_based_price_id: '',
      ...tier,
    })
  })
  return {
    id: '',
    stripe_id: '',
    subscription_product_id: '',
    billing_period: SubscriptionBillingPeriod.MONTHLY,
    currency,
    unit: unit.name,
    unit_title: unit.title,
    unit_title_plural: unit.titlePlural,
    usage_type,
    aggregate_usage,
    tiers_mode,
    billing_scheme,
    tiers: usageBasedPriceTiers,
  }
}

function generateCommonPlan(order: number, model: PricingModel) {
  if (order === 1) {
    return {
      stripe_id: '',
      order,
      title: 'Basic',
      description: '',
      model,
      public: true,
      features: [
        {
          order: 1,
          title: 'pricing.features.users.max',
          name: DefaultAppFeatures.Users,
          value: 2,
          type: SubscriptionFeatureLimitType.MAX,
          accumulate: false,
        },
        {
          order: 4,
          title: 'pricing.features.prioritySupport.none',
          name: DefaultAppFeatures.PrioritySupport,
          value: 0,
          type: SubscriptionFeatureLimitType.NOT_INCLUDED,
          accumulate: false,
        },
      ],
      badge: '',
      active: true,
      prices: [],
    }
  } else if (order === 2) {
    return {
      stripe_id: '',
      order,
      title: 'Pro',
      description: '',
      public: true,
      model,
      features: [
        {
          order: 1,
          title: 'pricing.features.users.max',
          name: DefaultAppFeatures.Users,
          value: 5,
          type: SubscriptionFeatureLimitType.MAX,
          accumulate: false,
        },
        {
          order: 4,
          title: 'pricing.features.prioritySupport.basic',
          name: DefaultAppFeatures.PrioritySupport,
          value: 0,
          type: SubscriptionFeatureLimitType.INCLUDED,
          accumulate: false,
        },
      ],
      badge: 'pricing.recommended',
      active: true,
    }
  } else if (order === 3) {
    return {
      stripe_id: '',
      order,
      title: 'Enterprise',
      description: '',
      public: true,
      model,
      features: [
        {
          order: 1,
          title: 'pricing.features.users.max',
          name: DefaultAppFeatures.Users,
          value: 12,
          type: SubscriptionFeatureLimitType.MAX,
          accumulate: false,
        },
        {
          order: 4,
          title: 'pricing.features.prioritySupport.priority',
          name: DefaultAppFeatures.PrioritySupport,
          value: 0,
          type: SubscriptionFeatureLimitType.INCLUDED,
          accumulate: false,
        },
      ],
      badge: '',
      active: true,
    }
  }

  return {
    stripe_id: '',
    order,
    title: 'pricing.products.plan1.title',
    description: 'pricing.products.plan1.description',
    model,
    public: true,
    features: [
      {
        order: 1,
        title: 'pricing.features.users.one',
        name: DefaultAppFeatures.Users,
        value: 1,
        type: SubscriptionFeatureLimitType.MAX,
        accumulate: false,
      },
    ],
    badge: '',
    active: true,
  }
}

const FLAT_RATE_PRICES: SubscriptionProductDto[] = [
  {
    ...generateCommonPlan(1, PricingModel.FLAT_RATE),
    prices: [
      generatePrice('usd', 9, SubscriptionBillingPeriod.MONTHLY),
      generatePrice('usd', 90, SubscriptionBillingPeriod.YEARLY),
      generatePrice('mxn', 199, SubscriptionBillingPeriod.MONTHLY),
      generatePrice('mxn', 1990, SubscriptionBillingPeriod.YEARLY),
    ],
    usageBasedPrices: [],
  },
  {
    ...generateCommonPlan(2, PricingModel.FLAT_RATE),
    prices: [
      generatePrice('usd', 199, SubscriptionBillingPeriod.MONTHLY),
      generatePrice('usd', 1990, SubscriptionBillingPeriod.YEARLY),
      generatePrice('mxn', 3999, SubscriptionBillingPeriod.MONTHLY),
      generatePrice('mxn', 39990, SubscriptionBillingPeriod.YEARLY),
    ],
    usageBasedPrices: [],
  },
  {
    ...generateCommonPlan(3, PricingModel.FLAT_RATE),
    prices: [
      generatePrice('usd', 399, SubscriptionBillingPeriod.MONTHLY),
      generatePrice('usd', 3990, SubscriptionBillingPeriod.YEARLY),
      generatePrice('mxn', 7999, SubscriptionBillingPeriod.MONTHLY),
      generatePrice('mxn', 79990, SubscriptionBillingPeriod.YEARLY),
    ],
    usageBasedPrices: [],
  },
]

const PER_SEAT_PRICES: SubscriptionProductDto[] = [
  ...FLAT_RATE_PRICES.map((item) => {
    return { ...item, model: PricingModel.PER_SEAT }
  }),
]

const USAGE_BASED_PRICES: SubscriptionProductDto[] = [
  {
    ...generateCommonPlan(1, PricingModel.USAGE_BASED),
    prices: [],
    usageBasedPrices: [
      generateUsageBasedPrice('usd', UNIT_CREDIT, 'metered', 'sum', 'volume', 'tiered', [
        { from: 0, to: 10, per_unit_price: 0.0, flat_fee_price: undefined },
        { from: 11, to: 20, per_unit_price: 0.02, flat_fee_price: 5 },
        { from: 21, to: undefined, per_unit_price: 0.01, flat_fee_price: 10 },
      ]),
      generateUsageBasedPrice('mxn', UNIT_CREDIT, 'metered', 'sum', 'volume', 'tiered', [
        { from: 0, to: 10, per_unit_price: 0.0, flat_fee_price: undefined },
        { from: 11, to: 20, per_unit_price: 0.4, flat_fee_price: 100 },
        { from: 21, to: undefined, per_unit_price: 0.2, flat_fee_price: 200 },
      ]),
    ],
  },
  {
    ...generateCommonPlan(2, PricingModel.USAGE_BASED),
    prices: [],
    usageBasedPrices: [
      generateUsageBasedPrice('usd', UNIT_CREDIT, 'metered', 'sum', 'volume', 'tiered', [
        { from: 0, to: 10, per_unit_price: 0.0, flat_fee_price: undefined },
        { from: 11, to: 20, per_unit_price: 0.04, flat_fee_price: 10 },
        { from: 21, to: undefined, per_unit_price: 0.02, flat_fee_price: 20 },
      ]),
      generateUsageBasedPrice('mxn', UNIT_CREDIT, 'metered', 'sum', 'volume', 'tiered', [
        { from: 0, to: 10, per_unit_price: 0.0, flat_fee_price: undefined },
        { from: 11, to: 20, per_unit_price: 0.8, flat_fee_price: 200 },
        { from: 21, to: undefined, per_unit_price: 0.4, flat_fee_price: 400 },
      ]),
    ],
  },
  {
    ...generateCommonPlan(3, PricingModel.USAGE_BASED),
    prices: [],
    usageBasedPrices: [
      generateUsageBasedPrice('usd', UNIT_CREDIT, 'metered', 'sum', 'volume', 'tiered', [
        { from: 0, to: 10, per_unit_price: 0.0, flat_fee_price: undefined },
        { from: 11, to: 20, per_unit_price: 0.06, flat_fee_price: 15 },
        { from: 21, to: undefined, per_unit_price: 0.03, flat_fee_price: 30 },
      ]),
      generateUsageBasedPrice('mxn', UNIT_CREDIT, 'metered', 'sum', 'volume', 'tiered', [
        { from: 0, to: 10, per_unit_price: 0.0, flat_fee_price: undefined },
        { from: 11, to: 20, per_unit_price: 1.2, flat_fee_price: 300 },
        { from: 21, to: undefined, per_unit_price: 0.6, flat_fee_price: 600 },
      ]),
    ],
  },
]

const FLAT_RATE_PLUS_USAGE_BASED_PRICES: SubscriptionProductDto[] = [
  ...FLAT_RATE_PRICES.map((flatRate) => {
    const usageBasedPrices =
      USAGE_BASED_PRICES.find((f) => f.order === flatRate.order)?.usageBasedPrices ?? []
    return {
      ...flatRate,
      usageBasedPrices,
      model: PricingModel.FLAT_RATE_USAGE_BASED,
    }
  }),
]

const ONE_TIME_PRICES: SubscriptionProductDto[] = [
  {
    ...generateCommonPlan(1, PricingModel.ONCE),
    prices: [
      generatePrice('usd', 99 * 2, SubscriptionBillingPeriod.ONCE),
      generatePrice('mxn', 1999 * 2, SubscriptionBillingPeriod.ONCE),
    ],
    usageBasedPrices: [],
  },
  {
    ...generateCommonPlan(2, PricingModel.ONCE),
    prices: [
      generatePrice('usd', 499 * 2, SubscriptionBillingPeriod.ONCE),
      generatePrice('mxn', 9999 * 2, SubscriptionBillingPeriod.ONCE),
    ],
    usageBasedPrices: [],
  },
  {
    ...generateCommonPlan(3, PricingModel.ONCE),
    prices: [
      generatePrice('usd', 1999 * 2, SubscriptionBillingPeriod.ONCE),
      generatePrice('mxn', 4999 * 2, SubscriptionBillingPeriod.ONCE),
    ],
    usageBasedPrices: [],
  },
]

const defaultPlans = [
  ...FLAT_RATE_PRICES,
  ...PER_SEAT_PRICES,
  ...USAGE_BASED_PRICES,
  ...FLAT_RATE_PLUS_USAGE_BASED_PRICES,
  ...ONE_TIME_PRICES,
]
export default defaultPlans
