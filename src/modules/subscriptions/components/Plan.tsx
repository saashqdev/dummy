'use client'

import clsx from 'clsx'
import { SubscriptionFeatureDto } from '@/modules/subscriptions/dtos/SubscriptionFeatureDto'
import { PricingModel } from '@/modules/subscriptions/enums/PricingModel'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import currencies from '@/modules/subscriptions/data/currencies'
import NumberUtils from '@/lib/utils/NumberUtils'
import { SubscriptionPriceDto } from '@/modules/subscriptions/dtos/SubscriptionPriceDto'
import { SubscriptionUsageBasedPriceDto } from '@/modules/subscriptions/dtos/SubscriptionUsageBasedPriceDto'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import { Fragment, useEffect, useRef, useState } from 'react'
import ErrorModal, { RefErrorModal } from '@/components/ui/modals/ErrorModal'
import useRootData from '@/lib/state/useRootData'
import { useTranslation } from 'react-i18next'
import Stripe from 'stripe'
import PlanFeatureDescription from './PlanFeatureDescription'
import PricingUtils from '@/modules/subscriptions/utils/PricingUtils'
import InputNumber from '@/components/ui/input/InputNumber'
import { useParams, useSearchParams } from 'next/navigation'
import { IServerAction } from '@/lib/dtos/ServerComponentsProps'

interface Props {
  product?: SubscriptionProductDto
  title: string
  description?: string
  badge?: string
  features: SubscriptionFeatureDto[]
  billing_period: SubscriptionBillingPeriod
  currency: string
  model: PricingModel
  prices: SubscriptionPriceDto[]
  usageBasedPrices?: SubscriptionUsageBasedPriceDto[]
  className?: string
  alreadyOwned?: boolean
  canSubmit?: boolean
  isUpgrade?: boolean
  isDowngrade?: boolean
  stripeCoupon: Stripe.Coupon | null
  isPreview?: boolean
  onClickFeature?: (name: string) => void
  serverAction: IServerAction | null
}

export default function Plan({
  product,
  title,
  description,
  badge,
  features,
  billing_period,
  model,
  currency,
  prices,
  usageBasedPrices,
  className,
  alreadyOwned,
  canSubmit,
  isUpgrade,
  isDowngrade,
  stripeCoupon,
  onClickFeature,
  serverAction,
}: Props) {
  const { t } = useTranslation()
  const search = useSearchParams()
  const searchParams = new URLSearchParams(search.toString())
  const rootData = useRootData()
  const params = useParams()

  const [loadingProductId, setLoadingProductId] = useState<string>()
  const [quantity, setQuantity] = useState(1)

  const [referral, setReferral] = useState<string | null>(null)

  useEffect(() => {
    if (
      !(typeof window === 'undefined') &&
      rootData.appConfiguration.affiliates?.provider.rewardfulApiKey
    ) {
      try {
        // @ts-ignore
        window.rewardful('ready', () => {
          // @ts-ignore
          // eslint-disable-next-line no-console
          // console.log("Rewardful ready", window.Rewardful.referral);
          // @ts-ignore
          setReferral(window.Rewardful.referral)
        })
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.log('Rewardful not found', e)
      }
    }
  }, [rootData.appConfiguration.affiliates?.provider.rewardfulApiKey])
  // const [usageBasedTiers, setUsageBasedTiers] = useState<{ from: number; to: number | undefined; prices: UsageBasedPriceDto[] }[]>([]);

  // useEffect(() => {
  //   const tiers: { from: number; to: number | undefined; prices: UsageBasedPriceDto[] }[] = [];
  //   usageBasedPrices.forEach((price) => {
  //     const tier = tiers.find((t) => t.from === price.from && t.to === price.to);
  //     if (!tier) {
  //       tiers.push({ from: price.from, to: price.to, prices: [price] });
  //     } else {
  //       tier.prices.push(price);
  //     }
  //   });
  //   setUsageBasedTiers(tiers.sort((a, b) => a.from - b.from));
  // }, [usageBasedPrices]);

  function getCurrencySymbol() {
    return currencies.find((f) => f.value === currency)?.symbol
  }
  function getCurrency() {
    return currencies.find((f) => f.value === currency)?.value
  }
  function getFlatPrice(): SubscriptionPriceDto | undefined {
    if (model !== PricingModel.ONCE) {
      return prices.find((f) => f.currency === currency && f.billing_period === billing_period)
    }
    return prices.find(
      (f) => f.currency === currency && f.billing_period === SubscriptionBillingPeriod.ONCE,
    )
  }

  function getFormattedPrice() {
    const price = getFlatPrice()
    if (!price) {
      return '?'
    }
    let total = applyDiscount(Number(price.price || 0))
    return PricingUtils.getFormattedPriceInCurrency({
      currency: price.currency,
      price: total,
      decimals: 0,
      withSymbol: false,
    })
  }

  function getCurrencySymbolAt(position: 'start' | 'end') {
    const currencyDetails = currencies.find((f) => f.value === currency)
    if (!currencyDetails) {
      return ''
    }
    if (currencyDetails.symbolRight) {
      if (position === 'start') {
        return ''
      }
      return currencyDetails.symbol
    } else {
      if (position === 'start') {
        return currencyDetails.symbol
      }
      return ''
    }
  }

  function getBeforePrice() {
    const price = getFlatPrice()
    if (!price) {
      return '?'
    }
    return NumberUtils.numberFormat(Number(price.price || 0))
  }

  const errorModal = useRef<RefErrorModal>(null)
  async function onClick() {
    const form = new FormData()
    setLoadingProductId(product?.id)
    form.set('action', 'subscribe')
    form.set('product-id', product?.id?.toString() ?? '')
    form.set('billing-period', billing_period.toString())
    form.set('currency', currency)
    form.set('quantity', quantity.toString())
    if (referral) {
      form.set('referral', referral)
    }
    const coupon = getCoupon()
    if (coupon) {
      form.set('coupon', searchParams.get('coupon')?.toString() ?? '')
    }
    if (isUpgrade) {
      form.set('is-upgrade', 'true')
    } else if (isDowngrade) {
      form.set('is-downgrade', 'true')
    }
    if (params?.tenant?.toString()) {
      form.set('tenantSlug', params.tenant.toString())
    }
    serverAction?.action(form)
  }
  function isDisabled() {
    if (!canSubmit) {
      return true
    }
    if (model === PricingModel.ONCE) {
      if (alreadyOwned && !product?.can_buy_again) {
        return true
      }
      return serverAction?.pending || !product?.stripe_id
    }
    return serverAction?.pending || !product?.stripe_id
  }

  const getCoupon = () => {
    if (!stripeCoupon) {
      return null
    }
    if (stripeCoupon.applies_to) {
      if (stripeCoupon.applies_to.products.includes(product?.stripe_id ?? '')) {
        // eslint-disable-next-line no-console
        console.log('Coupon applies to product: ', {
          product: t(product?.title ?? ''),
          discount: stripeCoupon.amount_off
            ? `${stripeCoupon.amount_off} ${stripeCoupon.currency}`
            : `${stripeCoupon.percent_off}%`,
          currency: stripeCoupon.currency,
          currentCurrency: currency,
        })
        if (!stripeCoupon.currency || stripeCoupon.currency === currency) {
          return stripeCoupon
        }
      }
    } else {
      if (!stripeCoupon.currency || stripeCoupon.currency === currency) {
        return stripeCoupon
      }
    }
    return null
  }

  function applyDiscount(total: number) {
    const coupon = getCoupon()
    if (!coupon) {
      return total
    }
    if (coupon.amount_off) {
      return total - coupon.amount_off / 100
    } else if (coupon.percent_off) {
      return total - (total * coupon.percent_off) / 100
    }
    return total
  }

  function noPricesForThisCurrency() {
    const flat = prices.filter((f) => f.currency === currency)
    const usageBased = usageBasedPrices?.filter((f) => f.currency === currency) ?? []
    return flat.length === 0 && usageBased.length === 0
  }

  function has_quantity() {
    return model === PricingModel.PER_SEAT || product?.has_quantity
  }

  return (
    <>
      {noPricesForThisCurrency() ? null : (
        <div className={className}>
          <section
            className={clsx(
              'relative flex w-full flex-col rounded-lg p-7 shadow-xl',
              !badge && 'border border-secondary',
              badge && 'border-2 border-primary',
            )}
          >
            {badge && (
              <div className="absolute top-0 -translate-y-1/2 transform rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                {t(badge)}
              </div>
            )}
            <div className="flex-1 space-y-4">
              {/* Title and Description */}
              <div className="flex-shrink-0 space-y-2">
                <h2 className="text-xl font-medium">{t(title)}</h2>
                {description && <p className="text-sm text-muted-foreground">{t(description)}</p>}
              </div>

              {/* Price */}
              {model !== PricingModel.USAGE_BASED && (
                <div className="flex-shrink-0 truncate">
                  <span className="pr-1 text-sm font-bold">{getCurrencySymbolAt('start')}</span>
                  {getCoupon() ? (
                    <Fragment>
                      <span className="mr-1 text-2xl font-normal tracking-tight text-muted-foreground line-through">
                        {getBeforePrice()}
                      </span>
                      <span className="text-4xl font-bold tracking-tight">
                        {getFormattedPrice()}
                      </span>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <span className="text-4xl font-bold tracking-tight">
                        {getFormattedPrice()}
                      </span>
                    </Fragment>
                  )}{' '}
                  <span className="pr-1 text-sm font-bold">{getCurrencySymbolAt('end')}</span>
                  <span className="truncate uppercase text-muted-foreground"> {getCurrency()}</span>
                  {model === PricingModel.PER_SEAT && (
                    <span className="text-muted-foreground">
                      /{t('pricing.seat').toLowerCase()}
                    </span>
                  )}
                  {(() => {
                    if (getFlatPrice()?.billing_period === SubscriptionBillingPeriod.MONTHLY) {
                      return (
                        <span className="truncate text-muted-foreground">
                          /{t('pricing.MONTHLYShort')}
                        </span>
                      )
                    } else if (
                      getFlatPrice()?.billing_period === SubscriptionBillingPeriod.YEARLY
                    ) {
                      return (
                        <span className="truncate text-muted-foreground">
                          /{t('pricing.YEARLYShort')}
                        </span>
                      )
                    }
                    // else if (getFlatPrice()?.billing_period === SubscriptionBillingPeriod.ONCE) {
                    //   return <span className="text-muted-foreground text-xs"> ({t("pricing.once")})</span>;
                    // }
                  })()}
                  {/* <div className="text-muted-foreground mt-2 text-xs italic">Cancel anytime</div> */}
                </div>
              )}

              {usageBasedPrices
                ?.sort((a, b) => (a.unit > b.unit ? 1 : -1))
                .filter((f) => f.currency === currency)
                .map((usageBasedPrice, idx) => {
                  return (
                    <div key={idx} className="flex flex-shrink-0 flex-col">
                      <div className="text-sm font-medium">
                        <span className="">+</span> {t(usageBasedPrice.unit_title_plural)}
                      </div>
                      <div className="mt-3">
                        <div className="-mx-4 overflow-auto ring-1 ring-muted sm:-mx-6 md:mx-0 md:rounded-lg">
                          <table className="min-w-full divide-y divide-muted">
                            <thead>
                              <tr>
                                {usageBasedPrice.tiers_mode === 'graduated' ? (
                                  <>
                                    <th
                                      scope="col"
                                      className="truncate px-3 py-2 text-left text-sm font-semibold"
                                    >
                                      {t(usageBasedPrice.unit_title_plural)}
                                    </th>
                                    <th
                                      scope="col"
                                      className="truncate px-3 py-2 text-left text-sm font-semibold"
                                    >
                                      {t('pricing.usageBased.units')}
                                      <span className="font-normal text-muted-foreground">/m</span>
                                    </th>
                                  </>
                                ) : (
                                  <th
                                    scope="col"
                                    className="truncate px-3 py-2 text-left text-sm font-semibold"
                                  >
                                    {t('pricing.usageBased.units')}
                                    <span className="font-normal text-muted-foreground">
                                      /month
                                    </span>
                                  </th>
                                )}
                                <th
                                  scope="col"
                                  className="truncate px-3 py-2 text-left text-sm font-semibold"
                                >
                                  {t('pricing.usageBased.perUnit')}
                                </th>
                                <th
                                  scope="col"
                                  className="truncate px-3 py-2 text-left text-sm font-semibold"
                                >
                                  {t('pricing.usageBased.flatFee')}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {usageBasedPrice.tiers.map((tier, idx) => {
                                return (
                                  <tr key={tier.from}>
                                    {usageBasedPrice.tiers_mode === 'graduated' && (
                                      <td className="relative px-3 py-2 text-sm">
                                        <div className="truncate font-medium">
                                          <span>
                                            {idx === 0
                                              ? t('pricing.usageBased.first')
                                              : t('pricing.usageBased.next')}
                                          </span>
                                        </div>
                                      </td>
                                    )}
                                    <td className="truncate px-3 py-2 text-sm text-muted-foreground lg:table-cell">
                                      {tier.from} - {tier.to ? tier.to : '∞'}
                                    </td>
                                    <td className="truncate px-3 py-2 text-sm text-muted-foreground lg:table-cell">
                                      {tier.per_unit_price ? (
                                        <span>
                                          <>
                                            {getCurrencySymbol()}
                                            {tier.per_unit_price ?? '-'}
                                            {/* <span className="text-xs uppercase">{getCurrency()}</span> */}
                                          </>
                                        </span>
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                    <td className="truncate px-3 py-2 text-sm text-muted-foreground lg:table-cell">
                                      {tier.flat_fee_price ? (
                                        <span>
                                          <>
                                            {getCurrencySymbol() ?? ''}
                                            {tier.flat_fee_price ?? '-'}
                                          </>
                                        </span>
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )
                })}

              {/* <div className="w-full border-t"></div> */}
              {/* Features */}
              <ul className="flex-1 space-y-1.5">
                {features
                  .sort((a, b) => (a.order > b.order ? 1 : -1))
                  .map((feature, idxFeature) => {
                    return (
                      <li key={idxFeature}>
                        <PlanFeatureDescription feature={feature} onClickFeature={onClickFeature} />
                      </li>
                    )
                  })}
              </ul>

              {/* {canSubmit && ( */}
              <div className="mt-4 space-y-2">
                {(!alreadyOwned || model === PricingModel.ONCE) &&
                getFlatPrice()?.price !== 0 &&
                has_quantity() &&
                (model === PricingModel.PER_SEAT || model === PricingModel.ONCE) ? (
                  <div className="grid grid-cols-2 gap-2">
                    <InputNumber
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e))}
                      disabled={isDisabled()}
                    />
                    <SubscribeOrBuyButton
                      isPreview={product?.stripe_id === undefined}
                      model={model}
                      price={getFlatPrice()}
                      badge={badge}
                      disabled={isDisabled()}
                      loading={serverAction?.pending && loadingProductId === product?.id}
                      onClick={onClick}
                      alreadyOwned={alreadyOwned}
                      isUpgrade={isUpgrade}
                      isDowngrade={isDowngrade}
                    />
                  </div>
                ) : (
                  <SubscribeOrBuyButton
                    product={product}
                    model={model}
                    price={getFlatPrice()}
                    badge={badge}
                    disabled={isDisabled()}
                    loading={serverAction?.pending && loadingProductId === product?.id}
                    onClick={onClick}
                    alreadyOwned={alreadyOwned}
                    isUpgrade={isUpgrade}
                    isDowngrade={isDowngrade}
                  />
                )}
              </div>
              {/* )} */}
            </div>
          </section>
          <ErrorModal ref={errorModal} />
        </div>
      )}
    </>
  )
}

interface SubscribeOrBuyButtonProps {
  product?: SubscriptionProductDto
  isPreview?: boolean
  model: PricingModel
  badge?: string
  disabled: boolean
  loading: boolean | undefined
  onClick: () => void
  alreadyOwned?: boolean
  price?: SubscriptionPriceDto
  isUpgrade?: boolean
  isDowngrade?: boolean
}
function SubscribeOrBuyButton({
  isPreview,
  model,
  price,
  badge,
  disabled,
  loading,
  onClick,
  alreadyOwned,
  isUpgrade,
  isDowngrade,
}: SubscribeOrBuyButtonProps) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'truncate',
        loading && 'base-spinner cursor-not-allowed',
        badge && !disabled
          ? 'group flex w-full items-center justify-center space-x-2 rounded-md border border-primary-foreground bg-primary px-8 py-2 text-sm font-medium text-primary-foreground'
          : 'group flex w-full items-center justify-center space-x-2 rounded-md border border-foreground bg-background px-8 py-2 text-sm font-medium text-foreground',
        badge && !disabled && 'hover:bg-primary/90',
        !badge && !disabled && 'hover:border-foreground hover:bg-secondary',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      {alreadyOwned ? (
        <>{model === PricingModel.ONCE ? t('pricing.buyAgain') : t('pricing.alreadyOwned')}</>
      ) : isPreview ? (
        <>{t('pricing.notCreated')}</>
      ) : isUpgrade ? (
        <div className="flex items-center space-x-1">
          <div>{t('shared.upgrade')}</div>
          <div>✨</div>
        </div>
      ) : isDowngrade ? (
        <>{t('shared.downgrade')}</>
      ) : (
        <span>
          <>
            {price && price.price === 0 ? (
              <span>{t('pricing.getItForFree')}</span>
            ) : (
              <span>{model === PricingModel.ONCE ? t('pricing.buy') : t('pricing.subscribe')}</span>
            )}
          </>
        </span>
      )}
    </button>
  )
}
