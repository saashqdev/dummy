'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatPriceDto } from '@/modules/subscriptions/dtos/FlatPriceDto'
import { SubscriptionPriceDto } from '@/modules/subscriptions/dtos/SubscriptionPriceDto'
import { PricingModel } from '@/modules/subscriptions/enums/PricingModel'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import billing_periods from '@/modules/subscriptions/data/billingPeriods'
import currencies from '@/modules/subscriptions/data/currencies'
import InputCombobox from '@/components/ui/input/InputCombobox'
import InputNumber from '@/components/ui/input/InputNumber'
import TableSimple, { RowHeaderDisplayDto } from '@/components/ui/tables/TableSimple'
import { updateItemByIdx } from '@/lib/utils/ObjectUtils'

interface Props {
  model: PricingModel
  prices: SubscriptionPriceDto[]
  setPrices: React.Dispatch<React.SetStateAction<SubscriptionPriceDto[]>>
  disabled: boolean
  isPortalPlan?: boolean
}
export default function FlatPrices({ model, prices, setPrices, disabled, isPortalPlan }: Props) {
  const { t } = useTranslation()
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<FlatPriceDto>[]>([])

  const [flatPrices, setFlatPrices] = useState<FlatPriceDto[]>([])
  const [selectedBillingPeriods, setSelectedBillingPeriods] = useState<SubscriptionBillingPeriod[]>(
    [SubscriptionBillingPeriod.MONTHLY, SubscriptionBillingPeriod.YEARLY],
  )
  const [trialPeriodDays, setTrialPeriodDays] = useState<number | undefined>(0)

  // Set initial flat prices
  useEffect(() => {
    const flatPrices: FlatPriceDto[] = []
    currencies
      .filter((f) => !f.disabled)
      .forEach((currency) => {
        const currencyPrices = prices.filter((f) => f.currency === currency.value)
        const oneTimePrice = currencyPrices.find(
          (f) => f.billing_period === SubscriptionBillingPeriod.ONCE,
        )
        const monthlyPrice = currencyPrices.find(
          (f) => f.billing_period === SubscriptionBillingPeriod.MONTHLY,
        )
        const quarterlyPrice = currencyPrices.find(
          (f) => f.billing_period === SubscriptionBillingPeriod.QUARTERLY,
        )
        const semiAnnualPrice = currencyPrices.find(
          (f) => f.billing_period === SubscriptionBillingPeriod.SEMI_ANNUAL,
        )
        const yearlyPrice = currencyPrices.find(
          (f) => f.billing_period === SubscriptionBillingPeriod.YEARLY,
        )
        flatPrices.push({
          currency: currency.value,
          monthlyPrice: monthlyPrice?.price ? Number(monthlyPrice.price) : undefined,
          yearlyPrice: yearlyPrice?.price ? Number(yearlyPrice.price) : undefined,
          oneTimePrice: oneTimePrice?.price ? Number(oneTimePrice.price) : undefined,
          quarterlyPrice: quarterlyPrice?.price ? Number(quarterlyPrice.price) : undefined,
          semiAnnualPrice: semiAnnualPrice?.price ? Number(semiAnnualPrice.price) : undefined,
        })
      })

    if (disabled) {
      let billing_periods = prices.flatMap((item) => item.billing_period)
      // unique
      billing_periods = billing_periods.filter((v, i, a) => a.indexOf(v) === i)
      setSelectedBillingPeriods(billing_periods)
    }

    setFlatPrices(flatPrices)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update prices
  useEffect(() => {
    const newPrices: SubscriptionPriceDto[] = []
    flatPrices.forEach((flatPrice) => {
      if (flatPrice.oneTimePrice !== undefined) {
        newPrices.push({
          currency: flatPrice.currency,
          billing_period: SubscriptionBillingPeriod.ONCE,
          price: flatPrice.oneTimePrice,
          trial_days: trialPeriodDays,
        } as SubscriptionPriceDto)
      }
      if (flatPrice.monthlyPrice !== undefined) {
        newPrices.push({
          currency: flatPrice.currency,
          billing_period: SubscriptionBillingPeriod.MONTHLY,
          price: flatPrice.monthlyPrice,
          trial_days: trialPeriodDays,
        } as SubscriptionPriceDto)
      }
      if (flatPrice.yearlyPrice !== undefined) {
        newPrices.push({
          currency: flatPrice.currency,
          billing_period: SubscriptionBillingPeriod.YEARLY,
          price: flatPrice.yearlyPrice,
          trial_days: trialPeriodDays,
        } as SubscriptionPriceDto)
      }
      if (flatPrice.quarterlyPrice !== undefined) {
        newPrices.push({
          currency: flatPrice.currency,
          billing_period: SubscriptionBillingPeriod.QUARTERLY,
          price: flatPrice.quarterlyPrice,
          trial_days: trialPeriodDays,
        } as SubscriptionPriceDto)
      }
      if (flatPrice.semiAnnualPrice !== undefined) {
        newPrices.push({
          currency: flatPrice.currency,
          billing_period: SubscriptionBillingPeriod.SEMI_ANNUAL,
          price: flatPrice.semiAnnualPrice,
          trial_days: trialPeriodDays,
        } as SubscriptionPriceDto)
      }
    })
    setPrices(newPrices as SubscriptionPriceDto[])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatPrices, trialPeriodDays])

  useEffect(() => {
    let headers: RowHeaderDisplayDto<FlatPriceDto>[] = [
      {
        name: 'currency',
        title: 'Currency',
        // value: (e) => e.currency?.toUpperCase(),
        value: (e) => (
          <div>
            {e.currency?.toUpperCase()}
            {/* currencies.find((o) => o.value === e.currency)?.name */}
          </div>
        ),
      },
    ]

    if (model !== PricingModel.ONCE) {
      headers = [
        ...headers,
        {
          name: 'monthlyPrice',
          title: 'Monthly Price',
          value: (e) => e.monthlyPrice,
          type: 'number',
          inputNumberStep: '0.01',
          onChange: (e, idx) =>
            updateItemByIdx(flatPrices, setFlatPrices, idx, { monthlyPrice: e }),
          editable: () => !disabled,
          inputOptional: true,
          hidden: !selectedBillingPeriods.find((f) => f === SubscriptionBillingPeriod.MONTHLY),
        },
        {
          name: 'quarterlyPrice',
          title: 'Quarterly Price',
          value: (e) => e.quarterlyPrice,
          type: 'number',
          inputNumberStep: '0.01',
          onChange: (e, idx) =>
            updateItemByIdx(flatPrices, setFlatPrices, idx, { quarterlyPrice: e }),
          editable: () => !disabled,
          inputOptional: true,
          hidden: !selectedBillingPeriods.find((f) => f === SubscriptionBillingPeriod.QUARTERLY),
        },
        {
          name: 'semiAnnualPrice',
          title: 'Semi-Annual Price',
          value: (e) => e.semiAnnualPrice,
          type: 'number',
          inputNumberStep: '0.01',
          onChange: (e, idx) =>
            updateItemByIdx(flatPrices, setFlatPrices, idx, { semiAnnualPrice: e }),
          editable: () => !disabled,
          inputOptional: true,
          hidden: !selectedBillingPeriods.find((f) => f === SubscriptionBillingPeriod.SEMI_ANNUAL),
        },
        {
          name: 'yearlyPrice',
          title: 'Yearly Price',
          value: (e) => e.yearlyPrice,
          type: 'number',
          inputNumberStep: '0.01',
          onChange: (e, idx) => updateItemByIdx(flatPrices, setFlatPrices, idx, { yearlyPrice: e }),
          editable: () => !disabled,
          inputOptional: true,
          hidden: !selectedBillingPeriods.find((f) => f === SubscriptionBillingPeriod.YEARLY),
        },
        {
          name: 'discount',
          title: 'Yearly Discount',
          className: 'text-center',
          // value: (e) => getYearlyDiscount(e),
          value: (e) => (
            <div className="flex justify-center">
              {getYearlyDiscount(e) ? (
                <span className="ml-1 inline-flex items-center rounded-md bg-teal-100 px-2.5 py-0.5 text-sm font-medium text-teal-800">
                  {getYearlyDiscount(e)}
                </span>
              ) : (
                <div className="text-xs italic text-gray-500">NA</div>
              )}
            </div>
          ),
          hidden:
            !selectedBillingPeriods.find((f) => f === SubscriptionBillingPeriod.YEARLY) ||
            !selectedBillingPeriods.find((f) => f === SubscriptionBillingPeriod.MONTHLY),
        },
      ]
    } else {
      headers = [
        ...headers,
        {
          name: 'oneTimePrice',
          title: 'One time Price',
          value: (e) => e.oneTimePrice,
          type: 'number',
          inputNumberStep: '0.01',
          onChange: (e, idx) =>
            updateItemByIdx(flatPrices, setFlatPrices, idx, { oneTimePrice: e }),
          editable: () => !disabled,
          inputOptional: true,
        },
      ]
    }
    setHeaders(headers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices, model, selectedBillingPeriods])

  useEffect(() => {
    const priceWithTrialDays = prices.find((f) => f.trial_days > 0)
    setTrialPeriodDays(priceWithTrialDays?.trial_days ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model])

  function getYearlyDiscount(item: FlatPriceDto): string | undefined {
    if (item.yearlyPrice && item.monthlyPrice) {
      const discount = 100 - (item.yearlyPrice * 100) / (item.monthlyPrice * 12)
      if (discount > 0) {
        return '- ' + discount.toFixed(0) + '% off'
      }
    }
    return undefined
  }

  return (
    <>
      <div className="space-y-2 divide-gray-300">
        {model !== PricingModel.ONCE && (
          <InputCombobox
            withSearch={false}
            disabled={disabled}
            name="selectedBillingPeriods"
            title="Billing Periods"
            value={selectedBillingPeriods}
            onChange={(e) => {
              setSelectedBillingPeriods(e as number[])
            }}
            options={billing_periods
              .filter((f) => !f.disabled && f.recurring)
              .map((item) => {
                return {
                  name: t('pricing.' + SubscriptionBillingPeriod[item.value]),
                  value: item.value,
                }
              })}
            minDisplayCount={5}
          />
        )}
        <TableSimple items={flatPrices} headers={headers} actions={[]} />
        {model === PricingModel.FLAT_RATE && !isPortalPlan && (
          <div className="w-32">
            <InputNumber
              disabled={disabled}
              name="trialPeriodDays"
              title="Trial period days"
              value={trialPeriodDays}
              onChange={setTrialPeriodDays}
            />
          </div>
        )}
        {prices.map((item, idx) => {
          return (
            <div key={idx} className=" ">
              <input
                hidden
                readOnly
                type="text"
                id="prices[]"
                name="prices[]"
                value={JSON.stringify(item)}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
