'use client'

import { useTranslation } from 'react-i18next'
import { SubscriptionUsageBasedPriceDto } from '@/modules/subscriptions/dtos/SubscriptionUsageBasedPriceDto'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { SubscriptionUsageBasedUnitDto } from '@/modules/subscriptions/dtos/SubscriptionUsageBasedUnitDto'
import UsageBasedPricesUnit from './UsageBasedPricesUnit'
import CollapsibleRow from '@/components/ui/tables/CollapsibleRow'
import { UNIT_CREDIT } from '@/modules/subscriptions/data/usageBasedUnits'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'

interface Props {
  initial: SubscriptionUsageBasedPriceDto[]
  onUpdate: (items: SubscriptionUsageBasedPriceDto[]) => void
  disabled: boolean
}
export default function UsageBasedPrices({ initial, onUpdate, disabled }: Props) {
  const { t } = useTranslation()

  const [units, setUnits] = useState<SubscriptionUsageBasedUnitDto[]>([])
  const [usageBasedPrices, setUsageBasedPrices] =
    useState<SubscriptionUsageBasedPriceDto[]>(initial)

  useEffect(() => {
    const units: SubscriptionUsageBasedUnitDto[] = []
    usageBasedPrices.forEach((usageBasedPrice) => {
      const unit = units.find((f) => f.unit === usageBasedPrice.unit)
      if (!unit) {
        units.push({
          unit: usageBasedPrice.unit,
          unit_title: usageBasedPrice.unit_title,
          unit_title_plural: usageBasedPrice.unit_title_plural,
          usage_type: usageBasedPrice.usage_type,
          aggregate_usage: usageBasedPrice.aggregate_usage,
          tiers_mode: usageBasedPrice.tiers_mode,
          billing_scheme: usageBasedPrice.billing_scheme,
          tiers: [],
          prices: [],
        })
      }
    })
    if (units.length === 0) {
      units.push({
        unit: UNIT_CREDIT.name,
        unit_title: UNIT_CREDIT.title,
        unit_title_plural: UNIT_CREDIT.titlePlural,
        usage_type: 'metered',
        tiers_mode: 'volume',
        aggregate_usage: 'sum',
        billing_scheme: 'tiered',
        tiers: [],
        prices: [],
      })
    }
    units.forEach((unit) => {
      const prices = usageBasedPrices.filter((f) => f.unit === unit.unit)
      prices.forEach((price) => {
        price.tiers.forEach((tier) => {
          const existingTier = unit.tiers.find(
            (f) => f.from === tier.from && (f.to === tier.to || (!f.to && !tier.to)),
          )
          if (!existingTier) {
            unit.tiers.push({
              from: tier.from,
              to: tier.to ? Number(tier.to) : undefined,
            })
          }
          unit.prices.push({
            currency: price.currency,
            from: tier.from ?? undefined,
            to: tier.to ?? undefined,
            per_unit_price: tier.per_unit_price ? Number(tier.per_unit_price) : undefined,
            flat_fee_price: tier.flat_fee_price ? Number(tier.flat_fee_price) : undefined,
          })
        })
      })
    })

    setUnits(units)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const usageBasedPrices: SubscriptionUsageBasedPriceDto[] = []
    units.forEach((unit) => {
      unit.prices
        .sort((a, b) => a.from - b.from)
        .forEach((price) => {
          const unitTier = {
            id: '',
            subscription_usage_based_price_id: '',
            from: price.from,
            to: price.to,
            per_unit_price: price.per_unit_price,
            flat_fee_price: price.flat_fee_price,
          }
          const existing = usageBasedPrices.find(
            (f) => f.unit === unit.unit && f.currency === price.currency,
          )
          if (existing) {
            existing.tiers.push(unitTier)
          } else {
            usageBasedPrices.push({
              id: '',
              subscription_product_id: '',
              stripe_id: '',
              billing_period: SubscriptionBillingPeriod.MONTHLY,
              currency: price.currency,
              unit: unit.unit,
              unit_title: unit.unit_title,
              unit_title_plural: unit.unit_title_plural,
              usage_type: unit.usage_type,
              aggregate_usage: unit.aggregate_usage,
              tiers_mode: unit.tiers_mode,
              billing_scheme: unit.billing_scheme,
              tiers: [unitTier],
            })
          }
        })
    })
    setUsageBasedPrices(usageBasedPrices)
  }, [units])

  useEffect(() => {
    onUpdate(usageBasedPrices)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageBasedPrices])

  function addUnit() {
    setUnits([
      ...units,
      {
        unit: UNIT_CREDIT.name,
        unit_title: UNIT_CREDIT.title,
        unit_title_plural: UNIT_CREDIT.titlePlural,
        usage_type: 'metered',
        aggregate_usage: 'sum',
        tiers_mode: 'volume',
        billing_scheme: 'tiered',
        tiers: [],
        prices: [],
      },
    ])
  }

  function removeUnit(item: SubscriptionUsageBasedUnitDto) {
    setUnits(units.filter((f) => f !== item))
  }

  function updateUnit(idx: number, item: SubscriptionUsageBasedUnitDto) {
    const newUnits = [...units]
    newUnits[idx] = item
    setUnits(newUnits)
  }

  return (
    <div className="space-y-2">
      {units.map((item, idx) => {
        return (
          <div key={idx} className="space-y-3">
            <CollapsibleRow
              initial={!disabled}
              className="bg-gray-50"
              key={idx}
              value={
                <div className="flex flex-col truncate">
                  <h3 className="text-sm font-bold text-gray-800">
                    {t(item.unit_title)} ({item.unit})
                  </h3>
                  <div className="truncate text-xs italic text-gray-500">
                    {t('pricing.usageBased.unit')} #{idx + 1}
                  </div>
                </div>
              }
              title={`${t('pricing.usageBased.unit')} #${idx + 1}`}
              onRemove={() => removeUnit(item)}
              disabled={disabled}
            >
              <UsageBasedPricesUnit
                key={idx}
                item={item}
                onUpdate={(item) => updateUnit(idx, item)}
                disabled={disabled}
              />
            </CollapsibleRow>
          </div>
        )
      })}

      <button
        type="button"
        onClick={addUnit}
        disabled={disabled}
        className={clsx(
          'flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 focus:text-gray-800 focus:ring focus:ring-gray-300 focus:ring-offset-1',
          disabled ? 'cursor-not-allowed bg-gray-50' : 'hover:bg-gray-100',
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <span className="font-medium uppercase">{t('shared.add')}</span>
      </button>

      {/* {JSON.stringify(usageBasedPrices)} */}
      {usageBasedPrices.map((item, idx) => {
        return (
          <div key={idx}>
            <input
              readOnly
              hidden
              type="text"
              id="usage-based-prices[]"
              name="usage-based-prices[]"
              value={JSON.stringify(item)}
            />
          </div>
        )
      })}

      {/* <UsageBasedPricesUnitForm ref={usageBasedPriceUnitForm} onAdded={set} /> */}
    </div>
  )
}
