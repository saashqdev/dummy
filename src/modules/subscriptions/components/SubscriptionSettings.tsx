'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import Stripe from 'stripe'
import { PlanFeatureUsageDto } from '@/modules/subscriptions/dtos/PlanFeatureUsageDto'
import MyBillingSession from '@/modules/subscriptions/components/MyBillingSession'
import MyInvoices from '@/modules/subscriptions/components/MyInvoices'
import MyPayments from '@/modules/subscriptions/components/MyPayments'
import MyProducts from '@/modules/subscriptions/components/MyProducts'
import MySubscriptionFeatures from '@/modules/subscriptions/components/MySubscriptionFeatures'
import MyUpcomingInvoice from '@/modules/subscriptions/components/MyUpcomingInvoice'
import SettingSection from '@/components/ui/sections/SettingSection'
import {
  TenantDto,
  TenantSubscriptionProductWithDetailsDto,
  TenantSubscriptionWithDetailsDto,
} from '@/db/models'
import { useActionState, useEffect } from 'react'
import { actionAppSettingsSubscription } from '@/app/(frontend)/(app)/fred/[tenant]/settings/subscription/page'
import { toast } from 'sonner'

export default function SubscriptionSettings({
  currentTenant,
  mySubscription,
  myInvoices,
  myPayments,
  myFeatures,
  myUpcomingInvoice,
}: {
  currentTenant: TenantDto
  mySubscription: TenantSubscriptionWithDetailsDto | null
  myInvoices: Stripe.Invoice[]
  myPayments: Stripe.PaymentIntent[]
  myFeatures: PlanFeatureUsageDto[]
  myUpcomingInvoice: Stripe.Invoice | null
}) {
  const { t } = useTranslation()
  const [actionData, action] = useActionState(actionAppSettingsSubscription, null)

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    } else if (actionData?.success) {
      toast.success(actionData.success)
    }
  }, [actionData])

  function onCancel(item: TenantSubscriptionProductWithDetailsDto) {
    const form = new FormData()
    form.set('action', 'cancel')
    form.set('tenant-subscription-product-id', item.id)
    action(form)
  }

  function onOpenCustomerPortal() {
    const form = new FormData()
    form.set('action', 'open-customer-portal')
    action(form)
  }

  return (
    <div className="space-y-4">
      <SettingSection
        title={t('settings.subscription.title')}
        description={
          <div className="flex flex-col space-y-1">
            <div>{t('settings.subscription.description')}</div>
            <div>
              {mySubscription?.products && mySubscription.products.length > 0 && (
                <Link
                  href={`/subscribe/${currentTenant.slug}`}
                  className="text-theme-600 underline"
                >
                  {t('settings.subscription.viewAllProducts')}
                </Link>
              )}
            </div>
          </div>
        }
        className=""
      >
        <MyProducts
          currentTenant={currentTenant}
          items={mySubscription?.products ?? []}
          onCancel={onCancel}
        />
      </SettingSection>

      {myFeatures.length > 0 && (
        <>
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-4">
              <div className="border-t border-border"></div>
            </div>
          </div>

          <SettingSection
            title={t('app.subscription.features.title')}
            description={t('app.subscription.features.description')}
            className=""
          >
            <MySubscriptionFeatures features={myFeatures} withCurrentPlan={false} />
          </SettingSection>
        </>
      )}

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-4">
          <div className="border-t border-border"></div>
        </div>
      </div>

      <SettingSection
        title={t('app.subscription.invoices.title')}
        description={t('app.subscription.invoices.description')}
      >
        <div className="space-y-2">
          <MyUpcomingInvoice item={myUpcomingInvoice} />
          <MyInvoices items={myInvoices} />
          <MyPayments items={myPayments} />
        </div>
      </SettingSection>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-4">
          <div className="border-t border-border"></div>
        </div>
      </div>

      <SettingSection
        title={t('app.subscription.billing.title')}
        description={t('app.subscription.billing.description')}
      >
        <div className="space-y-2">
          <MyBillingSession onClick={onOpenCustomerPortal} />
        </div>
      </SettingSection>
    </div>
  )
}
