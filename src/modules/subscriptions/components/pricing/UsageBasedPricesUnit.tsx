'use client'

import { useEffect, useState } from 'react'
import ButtonTertiary from '@/components/ui/buttons/ButtonTertiary'
import { useTranslation } from 'react-i18next'
import InputSelect from '@/components/ui/input/InputSelect'
import { SubscriptionUsageBasedUnitDto } from '@/modules/subscriptions/dtos/SubscriptionUsageBasedUnitDto'
import { usageBasedUnits } from '@/modules/subscriptions/data/usageBasedUnits'
import NumberUtils from '@/lib/utils/NumberUtils'
import currencies from '@/modules/subscriptions/data/currencies'
import TableSimple, { RowHeaderDisplayDto } from '@/components/ui/tables/TableSimple'
import TrashIcon from '@/components/ui/icons/TrashIcon'

const INCREMENT_BY = 100

interface Props {
  item: SubscriptionUsageBasedUnitDto
  onUpdate: (item: SubscriptionUsageBasedUnitDto) => void
  disabled: boolean
}
export default function UsageBasedPricesUnit({ item, onUpdate, disabled }: Props) {
  const { t } = useTranslation()

  const [unit, setUnit] = useState(item.unit)
  const [unit_title, setUnitTitle] = useState(item.unit_title)
  const [unit_title_plural, setUnitTitlePlural] = useState(item.unit_title_plural)
  const [usage_type, setUsageType] = useState(item.usage_type)
  const [aggregate_usage, setAggregateUsage] = useState(item.aggregate_usage)
  const [tiers_mode, setTiersMode] = useState(item.tiers_mode)
  const [billing_scheme, setBillingScheme] = useState(item.billing_scheme)
  const [allTiers, setAllTiers] = useState<{ from: number; to?: number }[]>(item.tiers)
  const [prices, setPrices] = useState(item.prices)

  const [perUnitHeaders, setPerUnitHeaders] = useState<
    RowHeaderDisplayDto<{ from: number; to?: number }>[]
  >([])
  const [flatFeeHeaders, setFlatFeeHeaders] = useState<
    RowHeaderDisplayDto<{ from: number; to?: number }>[]
  >([])

  useEffect(() => {
    const usageBasedUnit = usageBasedUnits.find((f) => f.name === unit)
    if (usageBasedUnit) {
      setUnitTitle(usageBasedUnit.title)
      setUnitTitlePlural(usageBasedUnit.titlePlural)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit])

  useEffect(() => {
    onUpdate({
      unit,
      unit_title,
      unit_title_plural,
      usage_type,
      aggregate_usage,
      tiers_mode,
      billing_scheme,
      tiers: allTiers,
      prices: prices,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    unit,
    unit_title,
    unit_title_plural,
    usage_type,
    aggregate_usage,
    tiers_mode,
    billing_scheme,
    prices,
  ])

  useEffect(() => {
    const allTiers: { from: number; to?: number }[] = []
    if (item) {
      item.tiers.forEach((tier) => {
        if (!allTiers.find((f) => f.from === tier.from && f.to === tier.to)) {
          allTiers.push({ from: tier.from, to: tier.to ?? undefined })
        }
      })
    } else {
      const generateTiers = 3
      for (let idx = 0; idx < generateTiers; idx++) {
        if (idx === 0) {
          allTiers.push({ from: 0, to: INCREMENT_BY })
        } else {
          const to = idx === generateTiers - 1 ? undefined : idx * INCREMENT_BY + INCREMENT_BY
          allTiers.push({ from: idx * INCREMENT_BY + 1, to })
        }
      }
    }
    updateNewTierLimits(allTiers)
    setAllTiers(allTiers)
  }, [item])

  useEffect(() => {
    let commonHeaders: RowHeaderDisplayDto<{ from: number; to?: number }>[] = []
    commonHeaders = [
      {
        name: 'fromTitle',
        title: '',
        value: (_, idx) => (
          <>
            {tiers_mode === 'graduated' ? (
              <div>{idx === 0 ? <div>For the first</div> : <div>For the next</div>}</div>
            ) : (
              <div>Total units</div>
            )}
          </>
        ),
      },
      {
        name: 'from',
        title: 'From',
        value: (e) => e.from,
        type: 'number',
        onChange: (e, idx) => updateTier(idx, Number(e)),
        editable: (_, idx) => !disabled || (idx !== undefined && idx > 0),
        className: 'w-24',
      },
      {
        name: 'to',
        title: 'To',
        // value: (e) => (e.to ? e.to : "∞"),
        value: (e) => (
          <div className="flex justify-center font-medium text-gray-500">
            {e.to ? <span>{NumberUtils.numberFormat(e.to)}</span> : <span>∞</span>}
          </div>
        ),
        className: 'w-24',
      },
    ]

    let perUnitHeaders: RowHeaderDisplayDto<{ from: number; to?: number }>[] = [...commonHeaders]
    let flatFeeHeaders: RowHeaderDisplayDto<{ from: number; to?: number }>[] = [...commonHeaders]

    currencies
      .filter((f) => !f.disabled)
      .forEach((currency) => {
        perUnitHeaders.push({
          name: currency.name,
          title: currency.value.toUpperCase(),
          value: (_, idx) => getCurrencyPrice(idx, currency.value)?.per_unit_price,
          type: 'number',
          inputNumberStep: '0.000001',
          onChange: (e, idx) => setPerUnitPrice(idx, currency.value, Number(e)),
          editable: () => !disabled,
          className: 'w-24',
        })
      })

    currencies
      .filter((f) => !f.disabled)
      .forEach((currency) => {
        flatFeeHeaders.push({
          name: currency.name,
          title: currency.value.toUpperCase(),
          value: (_, idx) => getCurrencyPrice(idx, currency.value)?.flat_fee_price,
          type: 'number',
          inputNumberStep: '1',
          onChange: (e, idx) => setFlatFeePrice(idx, currency.value, Number(e)),
          editable: () => !disabled,
          className: 'w-24',
        })
      })

    setPerUnitHeaders(perUnitHeaders)
    setFlatFeeHeaders(flatFeeHeaders)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, tiers_mode, allTiers, prices])

  function setPerUnitPrice(idx: number, currency: string, per_unit_price: number) {
    const newPrices = [...prices]
    const existingPrice = getCurrencyPrice(idx, currency)
    if (existingPrice) {
      existingPrice.per_unit_price = per_unit_price
    } else {
      newPrices.push({
        currency,
        from: allTiers[idx].from,
        to: allTiers[idx].to,
        per_unit_price,
      })
    }
    setPrices(newPrices)
  }

  function setFlatFeePrice(idx: number, currency: string, flat_fee_price: number) {
    const newPrices = [...prices]
    const existingPrice = getCurrencyPrice(idx, currency)
    if (existingPrice) {
      existingPrice.flat_fee_price = flat_fee_price
    } else {
      newPrices.push({
        currency,
        from: allTiers[idx].from,
        to: allTiers[idx].to,
        flat_fee_price,
      })
    }
    setPrices(newPrices)
  }

  function getCurrencyPrice(idx: number, currency: string) {
    if (allTiers.length > idx) {
      const { from, to } = allTiers[idx]
      const existingPrice = prices.find(
        (f) => f.currency === currency && f.from === from && f.to === to,
      )
      return existingPrice
    }
  }

  function updateTier(idx: number, from: number) {
    const newTiers = [...allTiers]
    newTiers[idx].from = from
    setAllTiers(updateNewTierLimits(newTiers))
    setPrices([])
  }

  function updateNewTierLimits(tiers: { from: number; to?: number }[]) {
    for (let idx = 0; idx < tiers.length; idx++) {
      const tier = tiers[idx]
      if (idx === 0) {
        tier.from = 0
      }
      if (idx === tiers.length - 1) {
        tier.to = undefined
      }
      if (idx > 0) {
        const previousTier = tiers[idx - 1]
        previousTier.to = tier.from - 1
      }
    }
    return tiers
  }

  function removeTier(idx: number) {
    if (allTiers.length > 1) {
      setAllTiers(updateNewTierLimits(allTiers.filter((o, i) => i !== idx)))
      setPrices([])
    }
  }

  function addTier() {
    if (allTiers.length === 0) {
      setAllTiers(updateNewTierLimits([{ from: 0, to: undefined }]))
    } else {
      const lastTier = allTiers[allTiers.length - 1]
      setAllTiers(
        updateNewTierLimits([
          ...allTiers,
          {
            from: lastTier.from + INCREMENT_BY,
            to: undefined,
          },
        ]),
      )
    }
    setPrices([])
  }

  return (
    <div className="mt-2 border-t border-gray-100 p-2">
      <div className="space-y-/2">
        <div className="mb-2 mt-2 flex items-center justify-between space-x-1">
          <div className="text-sm font-bold">{t('pricing.usageBased.usageBasedUnit')}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1 text-xs font-medium">{t('pricing.usageBased.unit')}</label>
            <InputSelect
              disabled={disabled}
              name="unit"
              options={[
                ...usageBasedUnits.map((item) => {
                  return {
                    name: `${t(item.title)} (${item.name})`,
                    value: item.name,
                  }
                }),
              ]}
              onChange={(e) => {
                setUnit(e?.toString() ?? '')
              }}
              value={unit}
            />
          </div>
          <div>
            <label className="mb-1 text-xs font-medium">{t('pricing.usageBased.usage_type')}</label>
            <InputSelect
              disabled={disabled}
              name="usage_type"
              options={[
                { name: 'License', value: 'licensed' },
                { name: 'Metered', value: 'metered' },
              ]}
              value={usage_type}
              onChange={(e) => setUsageType(e?.toString() ?? '')}
            />
          </div>
          <div>
            <label className="mb-1 text-xs font-medium">{t('pricing.usageBased.tiers_mode')}</label>
            <InputSelect
              disabled={disabled}
              name="tiers_mode"
              options={[
                { name: 'Volume', value: 'volume' },
                { name: 'Graduated', value: 'graduated' },
              ]}
              value={tiers_mode}
              onChange={(e) => setTiersMode(e?.toString() ?? '')}
            />
          </div>
          <div>
            <label className="mb-1 text-xs font-medium">
              {t('pricing.usageBased.aggregate_usage')}
            </label>
            <InputSelect
              disabled={disabled}
              name="aggregate_usage"
              options={[
                { name: 'Sum', value: 'sum' },
                { name: 'Max', value: 'max', disabled: true },
                { name: 'Last ever', value: 'last_ever', disabled: true },
                { name: 'Last during period', value: 'last_during_period', disabled: true },
              ]}
              value={aggregate_usage}
              onChange={(e) => setAggregateUsage(e?.toString() ?? '')}
            />
          </div>
          <div>
            <label className="mb-1 text-xs font-medium">
              {t('pricing.usageBased.billing_scheme')}
            </label>
            <InputSelect
              disabled={disabled}
              name="billing_scheme"
              options={[
                { name: 'Per unit', value: 'per_unit', disabled: true },
                { name: 'Tiered', value: 'tiered' },
              ]}
              value={billing_scheme}
              onChange={(e) => setBillingScheme(e?.toString() ?? '')}
            />
          </div>
        </div>

        <div className="mb-1 mt-2 flex items-center justify-between space-x-1">
          <div className="text-sm font-bold">{t('pricing.usageBased.per_unit_prices')}</div>
          {!disabled && (
            <ButtonTertiary onClick={addTier}>{t('pricing.usageBased.addTier')}</ButtonTertiary>
          )}
        </div>

        <TableSimple
          items={allTiers}
          headers={perUnitHeaders}
          actions={[
            {
              title: (
                <div>
                  <TrashIcon className="h-4 w-4 text-gray-500" />
                </div>
              ),
              onClick: (idx) => removeTier(idx),
              disabled: () => disabled || allTiers.length === 1,
            },
          ]}
        />
        <div className="mb-1 mt-2 flex items-center justify-between space-x-1">
          <div className="text-sm font-bold">{t('pricing.usageBased.flat_fee_prices')}</div>
          {!disabled && (
            <ButtonTertiary onClick={addTier}>{t('pricing.usageBased.addTier')}</ButtonTertiary>
          )}
        </div>

        <TableSimple
          items={allTiers}
          headers={flatFeeHeaders}
          actions={[
            {
              title: (
                <div>
                  <TrashIcon className="h-4 w-4 text-gray-500" />
                </div>
              ),
              onClick: (idx) => removeTier(idx),
              disabled: () => disabled || allTiers.length === 1,
            },
          ]}
        />
      </div>
    </div>
  )
}
