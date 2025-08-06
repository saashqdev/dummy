'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SubscriptionFeatureDto } from '@/modules/subscriptions/dtos/SubscriptionFeatureDto'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import InputCheckboxInline from '@/components/ui/input/InputCheckboxInline'
import ConfirmModal, { RefConfirmModal } from '@/components/ui/modals/ConfirmModal'
import Plan from '@/modules/subscriptions/components/Plan'
import ToggleBillingPeriod from '@/modules/subscriptions/components/ToggleBillingPeriod'
import { SubscriptionFeatureLimitType } from '@/modules/subscriptions/enums/SubscriptionFeatureLimitType'
import PricingFeaturesTable from './PricingFeaturesTable'
import { PricingModel } from '@/modules/subscriptions/enums/PricingModel'
import ButtonSecondary from '@/components/ui/buttons/ButtonSecondary'
import { DefaultAppFeatures } from '@/modules/subscriptions/data/appFeatures'
import FlatPrices from './FlatPrices'
import UsageBasedPrices from './UsageBasedPrices'
import CurrencyToggle from '@/components/ui/toggles/CurrencyToggle'
import currencies from '@/modules/subscriptions/data/currencies'
import InputSelect from '@/components/ui/input/InputSelect'
import { SubscriptionPriceDto } from '@/modules/subscriptions/dtos/SubscriptionPriceDto'
import { SubscriptionUsageBasedPriceDto } from '@/modules/subscriptions/dtos/SubscriptionUsageBasedPriceDto'
import billing_periods from '@/modules/subscriptions/data/billing_periods'
import PricingUtils from '@/modules/subscriptions/utils/PricingUtils'
import { Input } from '@/components/ui/input'
import { IServerAction } from '@/lib/dtos/ServerComponentsProps'
import { useRouter } from 'next/navigation'

interface Props {
  plans?: SubscriptionProductDto[]
  item?: SubscriptionProductDto | undefined
  canUpdate?: boolean
  canDelete?: boolean
  isPortalPlan?: boolean
  serverAction: IServerAction
}

export default function PricingPlanForm({
  plans,
  item,
  canUpdate = true,
  canDelete,
  isPortalPlan,
  serverAction,
}: Props) {
  const { t } = useTranslation()
  const router = useRouter()

  let pricingModels = [
    {
      name: t('pricing.' + PricingModel[PricingModel.FLAT_RATE]),
      value: PricingModel.FLAT_RATE,
    },
    {
      name: t('pricing.' + PricingModel[PricingModel.PER_SEAT]),
      value: PricingModel.PER_SEAT,
    },
    {
      name: t('pricing.' + PricingModel[PricingModel.USAGE_BASED]),
      value: PricingModel.USAGE_BASED,
    },
    {
      name: t('pricing.' + PricingModel[PricingModel.FLAT_RATE_USAGE_BASED]),
      value: PricingModel.FLAT_RATE_USAGE_BASED,
    },
    {
      name: t('pricing.' + PricingModel[PricingModel.ONCE]),
      value: PricingModel.ONCE,
    },
  ]
  if (isPortalPlan) {
    pricingModels = pricingModels.filter(
      (f) =>
        f.value !== PricingModel.USAGE_BASED &&
        f.value !== PricingModel.FLAT_RATE_USAGE_BASED &&
        f.value !== PricingModel.PER_SEAT,
    )
  }
  const inputTitle = useRef<HTMLInputElement>(null)
  const confirmRemove = useRef<RefConfirmModal>(null)

  const [order, setOrder] = useState<number | undefined>(item?.order ?? getNextOrder())
  const [title, setTitle] = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [group_title, setGroupTitle] = useState(item?.group_title ?? '')
  const [group_description, setGroupDescription] = useState(item?.group_description ?? '')
  const [model, setModel] = useState(item?.model ?? PricingModel.FLAT_RATE)
  const [badge, setBadge] = useState(item?.badge ?? '')
  const [is_public, setIsPublic] = useState(item?.public ?? false)
  const [features, setFeatures] = useState<SubscriptionFeatureDto[]>([])
  const [billing_address_collection, setBillingAddressCollection] = useState(
    item?.billing_address_collection === 'required' ? true : false,
  )
  const [has_quantity, setHasQuantity] = useState(item?.has_quantity ?? false)
  const [can_buy_again, setCanBuyAgain] = useState(item?.can_buy_again ?? false)

  const [prices, setPrices] = useState<SubscriptionPriceDto[]>(item?.prices ?? [])
  const [usageBasedPrices, setUsageBasedPrices] = useState<SubscriptionUsageBasedPriceDto[]>(
    item?.usageBasedPrices ?? [],
  )

  const [billing_period, setBillingPeriod] = useState<SubscriptionBillingPeriod>(
    billing_periods.find((f) => f.default)?.value ?? SubscriptionBillingPeriod.MONTHLY,
  )
  const [currency, setCurrency] = useState(currencies.find((f) => f.default)?.value ?? '')

  useEffect(() => {
    inputTitle.current?.focus()
    inputTitle.current?.select()

    if (item) {
      setFeatures(item.features)
    } else {
      if (!isPortalPlan) {
        const features: SubscriptionFeatureDto[] = [
          {
            order: 1,
            title: '1 user',
            name: DefaultAppFeatures.Users,
            type: SubscriptionFeatureLimitType.MAX,
            value: 1,
            accumulate: false,
          },
        ]
        features.push({
          order: features.length + 1,
          title: 'Priority support',
          name: DefaultAppFeatures.PrioritySupport,
          type: SubscriptionFeatureLimitType.NOT_INCLUDED,
          value: 0,
          accumulate: false,
        })
        setFeatures(features)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (model === PricingModel.ONCE) {
      setBillingPeriod(SubscriptionBillingPeriod.ONCE)
    } else {
      setBillingPeriod(SubscriptionBillingPeriod.MONTHLY)
    }
  }, [model, item])

  useEffect(() => {
    const possibleBillingPeriods = prices.filter((f) => f.price).flatMap((f) => f.billing_period)
    if (possibleBillingPeriods.includes(SubscriptionBillingPeriod.MONTHLY)) {
      setBillingPeriod(SubscriptionBillingPeriod.MONTHLY)
    } else {
      let found = -1
      billing_periods
        .filter((f) => !f.disabled)
        .forEach((billing_period) => {
          if (found === -1 && possibleBillingPeriods.includes(billing_period.value)) {
            found = billing_period.value
          }
        })
      if (found !== -1) {
        setBillingPeriod(found)
      }
    }

    const possibleCurrencies = prices.filter((f) => f.price).flatMap((f) => f.currency)
    const defaultCurrency = currencies.find((f) => f.default)?.value ?? 'usd'
    if (possibleCurrencies.includes(defaultCurrency)) {
      setCurrency(defaultCurrency)
    } else if (possibleCurrencies.length > 0) {
      setCurrency(possibleCurrencies[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function close() {
    router.push('/admin/settings/pricing')
    // navigate("/admin/settings/pricing", { replace: true });
  }

  function remove() {
    confirmRemove.current?.show(
      t('shared.confirmDelete'),
      t('shared.delete'),
      t('shared.cancel'),
      t('shared.warningCannotUndo'),
    )
  }
  function getNextOrder() {
    if (!plans || plans?.length === 0) {
      return 1
    }
    return Math.max(...plans.map((o) => o.order)) + 1
  }
  function getYearlyDiscount(): string | undefined {
    const priceYearly = prices.find(
      (f) => f.currency === currency && f.billing_period === SubscriptionBillingPeriod.YEARLY,
    )
    const priceMonthly = prices.find(
      (f) => f.currency === currency && f.billing_period === SubscriptionBillingPeriod.MONTHLY,
    )
    if (priceYearly && priceMonthly) {
      const discount = 100 - (Number(priceYearly.price) * 100) / (Number(priceMonthly.price) * 12)
      if (discount !== 0) {
        return '-' + discount.toFixed(0) + '%'
      }
    }
    return undefined
  }

  function yesRemove() {
    const form = new FormData()
    form.set('action', 'delete')
    form.set('id', item?.id ?? '')
    serverAction.action(form)
  }

  const possibleBillingPeriods = () => {
    if (model === PricingModel.ONCE) {
      return [SubscriptionBillingPeriod.ONCE]
    }
    let periods = prices.filter((f) => f.price).flatMap((f) => f.billing_period)
    // remove duplicates
    periods = periods.filter((v, i, a) => a.indexOf(v) === i)
    return PricingUtils.getSortedBillingPeriods(periods)
  }

  const possibleCurrencies = () => {
    let currencies = prices.filter((f) => f.price).flatMap((f) => f.currency)
    // remove duplicates
    currencies = currencies.filter((v, i, a) => a.indexOf(v) === i)
    return PricingUtils.getSortedCurrencies(currencies)
  }

  return (
    <>
      <form action={serverAction.action}>
        <input hidden readOnly name="action" value={item ? 'edit' : 'create'} />
        {item && <input hidden readOnly name="id" value={item.id} />}

        <div className="col-span-2 mx-auto max-w-5xl">
          <div className="divide-y divide-gray-200 sm:space-y-4">
            <div className="space-y-6 border border-gray-200 bg-white px-8 py-6 shadow-lg">
              <div className="flex items-center justify-between space-x-3">
                <div>
                  <div>
                    <h3 className="text-lg font-bold leading-6 text-gray-900">Product details</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Set a public or custom plan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-3">
                  <div className="space-y-1">
                    <label htmlFor="order" className="text-xs font-medium">
                      {t('models.subscription_product.order')}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="order"
                      title={t('models.subscription_product.order')}
                      value={order}
                      onChange={(e) => setOrder(Number(e.currentTarget.value))}
                      disabled={serverAction.pending}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <div className="space-y-1">
                    <label htmlFor="title" className="text-xs font-medium">
                      {t('models.subscription_product.title')}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      ref={inputTitle}
                      name="title"
                      title={t('models.subscription_product.title')}
                      value={title}
                      onChange={(e) => setTitle(e.currentTarget.value)}
                      disabled={serverAction.pending}
                      autoComplete="off"
                      minLength={1}
                      maxLength={99}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <div className="space-y-1">
                    <label htmlFor="title" className="text-xs font-medium">
                      {t('models.subscription_product.badge')}
                    </label>
                    <Input
                      name="badge"
                      title={t('models.subscription_product.badge')}
                      value={badge}
                      onChange={(e) => setBadge(e.currentTarget.value)}
                      disabled={serverAction.pending}
                      autoComplete="off"
                    />
                  </div>
                </div>
                {!isPortalPlan && (
                  <Fragment>
                    <div className="sm:col-span-4">
                      <div className="space-y-1">
                        {' '}
                        <label htmlFor="group-title" className="text-xs font-medium">
                          {t('models.subscription_product.group_title')}
                        </label>
                        <Input
                          name="group-title"
                          title={t('models.subscription_product.group_title')}
                          value={group_title}
                          onChange={(e) => setGroupTitle(e.currentTarget.value)}
                          disabled={serverAction.pending}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-8">
                      <div className="space-y-1">
                        <label htmlFor="group-description" className="text-xs font-medium">
                          {t('models.subscription_product.group_description')}
                        </label>

                        <Input
                          name="group-description"
                          title={t('models.subscription_product.group_description')}
                          value={group_description}
                          onChange={(e) => setGroupDescription(e.currentTarget.value)}
                          disabled={serverAction.pending}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </Fragment>
                )}
                <div className="sm:col-span-12">
                  <div className="space-y-1">
                    <label htmlFor="description" className="text-xs font-medium">
                      {t('models.subscription_product.description')}
                    </label>
                    <Input
                      name="description"
                      title={t('models.subscription_product.description')}
                      value={description}
                      onChange={(e) => setDescription(e.currentTarget.value)}
                      disabled={serverAction.pending}
                      minLength={1}
                      maxLength={999}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="sm:col-span-12">
                  <div>
                    <label className="mb-1 text-xs font-medium">
                      {t('models.subscription_product.model')}
                    </label>
                    <InputSelect
                      name="model"
                      value={model}
                      onChange={(e) => {
                        setModel(Number(e))
                      }}
                      options={pricingModels}
                      disabled={item !== undefined}
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-12">
                  <InputCheckboxInline
                    name="is-public"
                    title={t('models.subscription_product.public')}
                    value={is_public}
                    onChange={setIsPublic}
                    description={
                      <>
                        <span className="font-normal text-gray-500">
                          : is visible to SaaS users
                        </span>
                      </>
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-12">
                  <InputCheckboxInline
                    name="is-billing-required"
                    title={t('models.subscription_product.billing_address_collection')}
                    value={billing_address_collection}
                    onChange={setBillingAddressCollection}
                    description={
                      <>
                        <span className="font-normal text-gray-500">
                          : is required to collect the billing address from the user
                        </span>
                      </>
                    }
                  />
                </div>
                {model === PricingModel.ONCE && (
                  <div className="space-y-2 sm:col-span-12">
                    <InputCheckboxInline
                      name="has-quantity"
                      title="Has quantity"
                      value={has_quantity}
                      onChange={setHasQuantity}
                      description={
                        <>
                          <span className="font-normal text-gray-500">
                            : is possible to buy more than one
                          </span>
                        </>
                      }
                    />
                  </div>
                )}
                {model === PricingModel.ONCE && (
                  <div className="space-y-2 sm:col-span-12">
                    <InputCheckboxInline
                      name="can-buy-again"
                      title="Can buy again"
                      value={can_buy_again}
                      onChange={setCanBuyAgain}
                      description={
                        <>
                          <span className="font-normal text-gray-500">
                            : users can buy even if they already bought it
                          </span>
                        </>
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {[
              PricingModel.FLAT_RATE,
              PricingModel.PER_SEAT,
              PricingModel.FLAT_RATE_USAGE_BASED,
              PricingModel.ONCE,
            ].includes(model) && (
              <div className="space-y-6 border border-gray-200 bg-white px-8 py-6 shadow-lg">
                <div className="flex items-center justify-between space-x-3">
                  <div>
                    <div>
                      <h3 className="text-lg font-bold leading-6 text-gray-900">Flat prices</h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Set the monthly and yearly price</p>
                  </div>
                </div>

                <FlatPrices
                  model={model}
                  prices={prices}
                  setPrices={setPrices}
                  disabled={item !== undefined}
                  isPortalPlan={isPortalPlan}
                />
              </div>
            )}

            {(model === PricingModel.FLAT_RATE_USAGE_BASED ||
              model === PricingModel.USAGE_BASED) && (
              <div className="space-y-6 border border-gray-200 bg-white px-8 py-6 shadow-lg">
                <div className="flex items-center justify-between space-x-3">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold leading-6 text-gray-900">
                        Usage-based prices
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Additional to a flat fee, charge your users based on their usage.
                    </p>
                  </div>
                </div>

                <UsageBasedPrices
                  initial={usageBasedPrices}
                  onUpdate={(items) => setUsageBasedPrices(items)}
                  disabled={item !== undefined}
                />
              </div>
            )}

            <div className="space-y-2 border border-gray-200 bg-white px-8 py-6 shadow-lg">
              <div className="flex items-center justify-between space-x-3">
                <div>
                  <div>
                    <h3 className="text-lg font-bold leading-6 text-gray-900">Features</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Set the features</p>
                </div>
              </div>
              <PricingFeaturesTable plans={plans} items={features} setItems={setFeatures} />
            </div>

            <div className="space-y-6 border border-gray-200 bg-white px-8 py-6 shadow-lg">
              <div className="flex items-center justify-between space-x-3">
                <div>
                  <div>
                    <h3 className="text-lg font-bold leading-6 text-gray-900">Preview</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">This is how the plan looks like</p>
                </div>
              </div>

              <div className="flex justify-between space-x-2">
                <CurrencyToggle
                  value={currency}
                  onChange={setCurrency}
                  possibleCurrencies={possibleCurrencies()}
                />
                <ToggleBillingPeriod
                  size="sm"
                  billing_period={billing_period}
                  onChange={setBillingPeriod}
                  yearlyDiscount={getYearlyDiscount()}
                  possibleBillingPeriods={possibleBillingPeriods()}
                />
              </div>
              <div className="mt-6">
                <Plan
                  title={title}
                  description={description}
                  badge={badge}
                  features={features}
                  billing_period={billing_period}
                  currency={currency}
                  model={model}
                  prices={prices}
                  usageBasedPrices={usageBasedPrices}
                  stripeCoupon={null}
                  isPreview={true}
                  serverAction={null}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between space-x-2 py-5">
            <div>
              {item && (
                <ButtonSecondary
                  destructive={true}
                  disabled={serverAction.pending || !canDelete}
                  type="button"
                  onClick={remove}
                >
                  <div>{t('shared.delete')}</div>
                </ButtonSecondary>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <ButtonSecondary disabled={serverAction.pending} onClick={close}>
                <div>{t('shared.cancel')}</div>
              </ButtonSecondary>
              <LoadingButton
                isLoading={serverAction.pending}
                type="submit"
                disabled={serverAction.pending || !canUpdate}
              >
                {t('shared.save')}
              </LoadingButton>
            </div>
          </div>
        </div>
      </form>

      <ConfirmModal ref={confirmRemove} onYes={yesRemove} destructive />
    </>
  )
}
