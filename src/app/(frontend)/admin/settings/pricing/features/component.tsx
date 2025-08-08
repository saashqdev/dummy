'use client'

import { Fragment, useActionState, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import IndexPageLayout from '@/components/ui/layouts/IndexPageLayout'
import TableSimple, { RowHeaderDisplayDto } from '@/components/ui/tables/TableSimple'
import ButtonSecondary from '@/components/ui/buttons/ButtonSecondary'
import useAdminData from '@/lib/state/useAdminData'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import InputSelect from '@/components/ui/input/InputSelect'
import { getUserHasPermission } from '@/lib/helpers/PermissionsHelper'
import { SubscriptionFeatureInPlansDto } from '@/modules/subscriptions/dtos/SubscriptionFeatureInPlansDto'
import { PricingFeaturesLoaderData } from './page'
import { actionPricingFeatures } from './actions'
import { v4 as uuidv4 } from 'uuid'
import { SubscriptionFeatureLimitType } from '@/modules/subscriptions/enums/SubscriptionFeatureLimitType'
import OrderListButtons from '@/components/ui/sort/OrderListButtons'
import { Input } from '@/components/ui/input'
import InputCheckboxWithDescription from '@/components/ui/input/InputCheckboxWithDescription'
import PlanFeatureDescription from '@/modules/subscriptions/components/PlanFeatureDescription'
import InputNumber from '@/components/ui/input/InputNumber'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import InputCombobox from '@/components/ui/input/InputCombobox'
import ErrorBanner from '@/components/ui/banners/ErrorBanner'
import PlansGrouped from '@/modules/subscriptions/components/PlansGrouped'
import Modal from '@/components/ui/modals/Modal'
import PricingUtils from '@/modules/subscriptions/utils/PricingUtils'
import SlideOverWideEmpty from '@/components/ui/slideOvers/SlideOverWideEmpty'

function getInitialItems(plans: SubscriptionProductDto[]) {
  const items: SubscriptionFeatureInPlansDto[] = []
  plans.forEach((plan) => {
    plan.features.forEach((feature) => {
      if (!feature.name) {
        feature.name = feature.title
      }
      const existing = items.find((f) => f.name === feature.name)
      if (existing) {
        existing.plans.push({
          id: plan.id!,
          title: feature.title,
          type: feature.type,
          value: feature.value,
        })
      } else {
        items.push({
          id: uuidv4(),
          ...feature,
          plans: [
            {
              id: plan.id!,
              title: feature.title,
              type: feature.type,
              value: feature.value,
            },
          ],
        })
      }
    })
  })

  plans.forEach((plan) => {
    items.forEach((feature) => {
      if (!feature.plans.find((p) => p.id === plan.id)) {
        feature.plans.push({
          id: plan.id!,
          title: '?',
          type: SubscriptionFeatureLimitType.NOT_INCLUDED,
          value: 0,
        })
      }
    })
  })

  return items
}

export default function ({ data }: { data: PricingFeaturesLoaderData }) {
  const { t } = useTranslation()
  const [actionData, action, pending] = useActionState(actionPricingFeatures, null)
  const adminData = useAdminData()

  const [showPreview, setShowPreview] = useState(false)

  const [items, setItems] = useState<SubscriptionFeatureInPlansDto[]>([])
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<SubscriptionFeatureInPlansDto>[]>([])

  const [selectedPlans, setSelectedPlans] = useState<SubscriptionProductDto[]>(data.items)

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success)
    } else if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  useEffect(() => {
    setItems(getInitialItems(selectedPlans))
  }, [selectedPlans])

  useEffect(() => {
    const headers: RowHeaderDisplayDto<SubscriptionFeatureInPlansDto>[] = [
      {
        title: t('shared.order'),
        name: 'order',
        // value: (item) => item.order,
        value: (_, idx) => (
          <OrderListButtons
            index={idx}
            items={items}
            onChange={(items) => {
              setItems(items as SubscriptionFeatureInPlansDto[])
            }}
            serverAction={{
              actionData,
              action,
              pending,
            }}
          />
        ),
      },
      {
        title: 'Title',
        name: 'feature-title',
        value: (item) => (
          <ClosedOpenedValue
            closed={
              <div className="flex flex-col space-y-2 px-1 py-2">
                {/* <div className="font-medium">{t(item.title)}</div> */}
                <div className="font-bold">
                  {item.name ? (
                    <span>
                      {item.name}{' '}
                      {item.accumulate ? (
                        <span className="text-xs font-light italic text-gray-400">
                          (accumulates)
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-red-600 underline">Click to set</span>
                  )}
                </div>
              </div>
            }
            opened={
              <div className="flex flex-col space-y-2 px-1 py-2">
                <div>
                  <label className="mb-1 text-xs font-medium">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    title="Name"
                    placeholder="Name..."
                    value={item.name}
                    required
                    onChange={(e) => {
                      item.name = e.currentTarget.value
                      setItems([...items])
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 text-xs font-medium">URL</label>

                  <Input
                    name="href"
                    title="URL"
                    placeholder="URL..."
                    value={item.href ?? undefined}
                    onChange={(e) => {
                      item.href = e.currentTarget.value
                      setItems([...items])
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 text-xs font-medium">Badge</label>
                  <Input
                    name="badge"
                    title="Badge"
                    placeholder=".e.g. New!"
                    value={item.badge ?? undefined}
                    onChange={(e) => {
                      item.badge = e.currentTarget.value
                      setItems([...items])
                    }}
                  />
                </div>
                <div>
                  <InputCheckboxWithDescription
                    name="accumulate"
                    title="Accumulate"
                    defaultValue={item.accumulate}
                    // value={item.accumulate}
                    onChange={(e) => {
                      item.accumulate = Boolean(e)
                      setItems([...items])
                    }}
                    description="Accumulates when user buys multiple times"
                  />
                </div>
              </div>
            }
          />
        ),
      },
      // {
      //   name: "accumulate",
      //   title: "Accumulate",
      //   value: (item) => {
      //     return item.accumulate ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-300" />
      //   }
      // },
    ]

    selectedPlans.forEach((plan) => {
      headers.push({
        title: t(plan.title),
        name: 'feature-in-' + plan.id,
        value: (item) => {
          const existing = item.plans.find((p) => p.id === plan.id)
          return (
            <ClosedOpenedValue
              closed={
                <div>
                  {!item.name || !existing || !existing.title.trim() || existing.title === '?' ? (
                    <div className="text-red-600 underline">Click to set</div>
                  ) : (
                    <PlanFeatureDescription
                      feature={{
                        ...item,
                        title: existing?.title ?? '',
                        value: existing?.value ?? 0,
                        type: existing?.type ?? SubscriptionFeatureLimitType.NOT_INCLUDED,
                      }}
                      editing={true}
                    />
                  )}
                </div>
              }
              opened={
                <div className="flex flex-col space-y-2 px-1 py-2">
                  {!existing ? (
                    <div>-</div>
                  ) : (
                    <Fragment>
                      <div>
                        <label className="mb-1 text-xs font-medium">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="title"
                          title="Title"
                          placeholder="Title..."
                          value={existing?.title}
                          required
                          onChange={(e) => {
                            existing.title = e.currentTarget.value
                            setItems([...items])
                          }}
                        />
                      </div>
                      <div>
                        <div>
                          <label className="mb-1 text-xs font-medium">Type</label>
                          <InputSelect
                            name="type"
                            value={existing?.type}
                            onChange={(e) => {
                              let type = Number(e) as SubscriptionFeatureLimitType
                              if (existing) {
                                existing.type = type
                                if (
                                  ![
                                    SubscriptionFeatureLimitType.MAX,
                                    SubscriptionFeatureLimitType.MONTHLY,
                                  ].includes(type)
                                ) {
                                  existing.value = 0
                                }
                              } else {
                                item.plans.push({
                                  id: plan.id!,
                                  title: '?',
                                  type,
                                  value: 0,
                                })
                              }
                              setItems([...items])
                            }}
                            options={[
                              {
                                name: 'Not included',
                                value: SubscriptionFeatureLimitType.NOT_INCLUDED,
                              },
                              {
                                name: 'Included',
                                value: SubscriptionFeatureLimitType.INCLUDED,
                              },
                              {
                                name: 'Monthly',
                                value: SubscriptionFeatureLimitType.MONTHLY,
                              },
                              {
                                name: 'Max',
                                value: SubscriptionFeatureLimitType.MAX,
                              },
                              {
                                name: 'Unlimited',
                                value: SubscriptionFeatureLimitType.UNLIMITED,
                              },
                            ]}
                          />
                        </div>
                      </div>
                      <div>
                        <InputNumber
                          name="value"
                          title="Limit"
                          value={existing?.value}
                          onChange={(e) => {
                            let value = e as number
                            if (existing) {
                              existing.value = value
                            } else {
                              item.plans.push({
                                id: plan.id!,
                                title: '?',
                                type: SubscriptionFeatureLimitType.MAX,
                                value,
                              })
                            }
                            setItems([...items])
                          }}
                          disabled={
                            ![
                              SubscriptionFeatureLimitType.MONTHLY,
                              SubscriptionFeatureLimitType.MAX,
                            ].includes(existing?.type ?? 0)
                          }
                        />
                      </div>
                    </Fragment>
                  )}
                </div>
              }
            />
          )
        },
      })
    })

    setHeaders(headers)
  }, [selectedPlans, items, t])

  function sortedItems() {
    return items.sort((a, b) => a.order - b.order)
  }

  function onAdd() {
    const lastItem = items.length > 0 ? sortedItems()[items.length - 1] : undefined
    const item: SubscriptionFeatureInPlansDto = {
      id: uuidv4(),
      name: 'untitled-feature',
      order: items.length + 1,
      accumulate: false,
      plans: selectedPlans.map((p) => {
        const lastPlanFeature = lastItem?.plans.find((f) => f.id === p.id)
        return {
          id: p.id!,
          title: lastPlanFeature?.title ?? '',
          type: lastPlanFeature?.type ?? SubscriptionFeatureLimitType.NOT_INCLUDED,
          value: lastPlanFeature?.value ?? 0,
        }
      }),
    }
    setItems([...items, item])
  }

  function getErrors() {
    let errors: string[] = []
    const duplicatedNames = items.filter(
      (item, index) => items.findIndex((i) => i.name === item.name) !== index,
    )
    if (duplicatedNames.length > 0) {
      errors = [...errors, ...duplicatedNames.map((item) => `Duplicated name "${item.name}"`)]
    }
    items.forEach((item) => {
      item.plans.forEach(({ id, title }) => {
        const plan = selectedPlans.find((p) => p.id === id)
        if (!plan) {
          return
        }
        if (!title.trim() || title === '?') {
          errors.push(`Invalid feature title "${title}" in plan "${t(plan.title)}"`)
        }
      })
    })
    return errors
  }

  function onSave() {
    const form = new FormData()
    form.set('action', 'update-features')
    form.set('planIds', JSON.stringify(selectedPlans.map((p) => p.id)))
    form.set('features', JSON.stringify(items))
    action(form)
  }

  return (
    <Fragment>
      <IndexPageLayout
        title={'Features'}
        menu={[
          { title: t('admin.pricing.title'), routePath: '/admin/settings/pricing' },
          {
            title: t('models.subscriptionFeature.plural'),
            routePath: '/admin/settings/pricing/features',
          },
        ]}
        buttons={
          <>
            <ButtonSecondary onClick={() => setShowPreview(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <div>{t('shared.preview')}</div>
            </ButtonSecondary>
            <ButtonSecondary onClick={() => setItems(getInitialItems(selectedPlans))}>
              {t('shared.reset')}
            </ButtonSecondary>
            <LoadingButton
              isLoading={pending}
              disabled={
                getErrors().length > 0 || !getUserHasPermission(adminData, 'admin.pricing.update')
              }
              onClick={onSave}
            >
              {t('shared.save')}
            </LoadingButton>
          </>
        }
      >
        <div className="flex space-x-1">
          <InputCombobox
            className="w-72"
            withSearch={false}
            title="Plans"
            value={selectedPlans.map((p) => p.id) as string[]}
            onChange={(e) => {
              const ids = e as string[]
              setSelectedPlans(data.items.filter((p) => ids.includes(p.id ?? '')))
            }}
            options={data.items.map((p) => ({ name: t(p.title), value: p.id }))}
            minDisplayCount={4}
          />
          {/* <div className="font-medium">Plans:</div>
            <div>{data.items.map((p) => t(p.title)).join(", ")}</div> */}
        </div>

        {getErrors().length > 0 && (
          <div>
            <ErrorBanner title="Errors">
              <div>
                {getErrors().map((error) => {
                  return <div key={error}>{error}</div>
                })}
              </div>
            </ErrorBanner>
          </div>
        )}

        <TableSimple
          headers={headers}
          items={sortedItems()}
          actions={[
            {
              title: 'Remove',
              destructive: true,
              onClick: (idx) => {
                const item = items[idx]
                if (item) {
                  setItems(items.filter((i) => i.id !== item.id))
                }
              },
            },
          ]}
        />

        <button
          type="button"
          onClick={onAdd}
          className="mt-2 flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:text-gray-800 focus:ring focus:ring-gray-300 focus:ring-offset-1"
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

        <Modal open={showPreview} setOpen={() => setShowPreview(false)} size="7xl">
          <PlansGrouped
            items={selectedPlans.map((f) => {
              return {
                ...f,
                features: items.map((item) => {
                  const feature = item.plans.find((p) => p.id === f.id)
                  return {
                    ...item,
                    title: feature?.title ?? '',
                    type: feature?.type ?? SubscriptionFeatureLimitType.NOT_INCLUDED,
                    value: feature?.value ?? 0,
                  }
                }),
              }
            })}
            stripeCoupon={null}
            canSubmit={false}
            currenciesAndPeriod={PricingUtils.getCurrenciesAndPeriods(
              selectedPlans.flatMap((f) => f.prices),
            )}
            serverAction={null}
          />
        </Modal>
      </IndexPageLayout>
    </Fragment>
  )
}

function ClosedOpenedValue({
  closed,
  opened,
}: {
  closed: React.ReactNode
  opened: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button type="button" className="hover:underline" onClick={() => setOpen(true)}>
        {closed}
      </button>
      <SlideOverWideEmpty
        withTitle={false}
        withClose={false}
        title={''}
        open={open}
        onClose={() => setOpen(false)}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setOpen(false)
            }}
            className="space-y-4"
          >
            {opened}
          </form>
        </div>
      </SlideOverWideEmpty>
    </div>
  )
}
