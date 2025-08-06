'use client'

import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import Plan from './Plan'
import ToggleBillingPeriod from './ToggleBillingPeriod'
import CurrencyToggle from '@/components/ui/toggles/CurrencyToggle'
import { PricingModel } from '@/modules/subscriptions/enums/PricingModel'
import PricingUtils from '@/modules/subscriptions/utils/PricingUtils'
import { SubscriptionPriceDto } from '@/modules/subscriptions/dtos/SubscriptionPriceDto'
import Stripe from 'stripe'
import { TenantSubscriptionWithDetailsDto } from '@/db/models'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { IServerAction } from '@/lib/dtos/ServerComponentsProps'

interface Props {
  items: SubscriptionProductDto[]
  tenantSubscription?: TenantSubscriptionWithDetailsDto | null
  canSubmit?: boolean
  className?: string
  stripeCoupon: Stripe.Coupon | null
  currenciesAndPeriod: {
    currencies: { value: string; options: string[] }
    billing_periods: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] }
  }
  onClickFeature?: (name: string) => void
  serverAction: IServerAction | null
}
export default function Plans({
  items,
  tenantSubscription,
  canSubmit,
  className,
  stripeCoupon,
  currenciesAndPeriod,
  onClickFeature,
  serverAction,
}: Props) {
  const searchParams = useSearchParams()
  const search = new URLSearchParams(searchParams.toString())
  const router = useRouter()
  const pathname = usePathname()
  const [products] = useState(items)
  const [currency, setCurrency] = useState(currenciesAndPeriod.currencies.value)
  const [billing_period, setBillingPeriod] = useState<SubscriptionBillingPeriod>(
    currenciesAndPeriod.billing_periods.value,
  )

  useEffect(() => {
    if (currency !== currenciesAndPeriod.currencies.value) {
      setCurrency(currenciesAndPeriod.currencies.value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currenciesAndPeriod.currencies.value])

  function getRecurringPrices() {
    let prices: SubscriptionPriceDto[] = []
    products
      .filter((f) => f.model !== PricingModel.ONCE)
      .forEach((product) => {
        const recurringPrices = product.prices
        prices = prices.concat(recurringPrices)
      })
    return prices
  }

  function alreadyOwned(plan: SubscriptionProductDto) {
    const found = tenantSubscription?.products.find((f) => f.subscription_product_id === plan.id)
    if (found) {
      return true
    }
    return false
  }

  function checkUpgradeDowngrade(plan: SubscriptionProductDto) {
    const existing = tenantSubscription?.products.find((f) => f)?.subscription_product
    if (existing) {
      if (plan.order > existing.order) {
        return { upgrade: true }
      } else {
        return { downgrade: true }
      }
    }
  }

  return (
    <div className={clsx(className, items.length === 1 && 'mx-auto max-w-2xl')}>
      <div className="flex items-center justify-between">
        <div>
          <CurrencyToggle
            value={currency}
            onChange={(e) => {
              search.set('c', e)
              router.replace(`${pathname}?${search.toString()}`)
              // searchParams.set("c", e.toString());
              // setSearchParams(searchParams, {
              //   preventScrollReset: true,
              // });
              setCurrency(e)
            }}
            possibleCurrencies={currenciesAndPeriod.currencies.options}
            darkMode
          />
        </div>
        <div>
          <ToggleBillingPeriod
            size="sm"
            billing_period={billing_period}
            onChange={(e) => {
              // console.log("Set billing period: ", SubscriptionBillingPeriod[e]);
              search.set('b', PricingUtils.getBillingPeriodParams(e))
              router.replace(`${pathname}?${search.toString()}`)
              // searchParams.set("b", PricingUtils.getBillingPeriodParams(e));
              // setSearchParams(searchParams, {
              //   preventScrollReset: true,
              // });
              setBillingPeriod(e)
            }}
            yearlyDiscount={PricingUtils.getYearlyDiscount(getRecurringPrices(), currency)}
            possibleBillingPeriods={currenciesAndPeriod.billing_periods.options}
            darkMode
          />
        </div>
      </div>
      <div
        className={clsx(
          'grid gap-6 lg:gap-3',
          items.length === 2 && 'lg:grid-cols-2 xl:grid-cols-2',
          items.length === 3 && 'lg:grid-cols-3 xl:grid-cols-3',
          items.length === 4 && 'lg:grid-cols-4 xl:grid-cols-4',
          items.length === 5 && 'lg:grid-cols-4 xl:grid-cols-4',
          items.length === 6 && 'lg:grid-cols-3 xl:grid-cols-3',
          items.length === 7 && 'lg:grid-cols-3 xl:grid-cols-3',
          items.length >= 8 && 'lg:grid-cols-3 xl:grid-cols-3',
        )}
      >
        {products.map((plan, index) => {
          return (
            <Plan
              key={index}
              className={clsx(
                (products.length === 1 || (products.length === 4 && index === 3)) &&
                  'lg:col-span-1',
              )}
              product={plan}
              title={plan.title}
              description={plan.description ?? undefined}
              badge={plan.badge ?? undefined}
              features={plan.features}
              billing_period={billing_period}
              currency={currency}
              prices={plan.prices}
              model={plan.model}
              usageBasedPrices={plan.usageBasedPrices}
              alreadyOwned={alreadyOwned(plan)}
              // tenantSubscription={tenantSubscription}
              canSubmit={canSubmit}
              isUpgrade={checkUpgradeDowngrade(plan)?.upgrade}
              isDowngrade={checkUpgradeDowngrade(plan)?.downgrade}
              stripeCoupon={stripeCoupon}
              onClickFeature={onClickFeature}
              serverAction={serverAction}
            />
          )
        })}
      </div>
    </div>
  )
}
