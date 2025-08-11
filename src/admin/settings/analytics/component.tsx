'use client'

import { useActionState, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import toast from 'react-hot-toast'
import IndexPageLayout from '@/components/ui/layouts/IndexPageLayout'
import InputCheckboxWithDescription from '@/components/ui/input/InputCheckboxWithDescription'
import useRootData from '@/lib/state/useRootData'
import { actionAnalyticsSettings } from './actions'
import { Input } from '@/components/ui/input'

export default function () {
  const { t } = useTranslation()
  const { appConfiguration } = useRootData()
  const [actionData, action, pending] = useActionState(actionAnalyticsSettings, null)

  const [canUpdate] = useState(true)

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success)
    } else if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <IndexPageLayout title={t('settings.admin.analytics.title')}>
      <form action={action} className="divide-y-gray-200 mt-6 space-y-8 divide-y">
        <input name="action" value="update" hidden readOnly />
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
          <div className="sm:col-span-6">
            <InputCheckboxWithDescription
              name="simpleAnalytics"
              defaultValue={appConfiguration.analytics.simple_analytics}
              title="SimpleAnalytics enabled"
              description={
                <a
                  href="https://www.simpleanalytics.com/?referral=hesef"
                  target="_blank"
                  rel="noreferrer"
                >
                  Click here to learn more.
                </a>
              }
              disabled={!canUpdate}
            />

            <InputCheckboxWithDescription
              name="plausibleAnalytics"
              defaultValue={appConfiguration.analytics.plausible_analytics}
              title="PlausibleAnalytics enabled"
              description={
                <a href="https://plausible.io/" target="_blank" rel="noreferrer">
                  Click here to learn more.
                </a>
              }
              disabled={!canUpdate}
            />

            <div>
              <label className="mb-1 text-sm font-medium">Google Analytics Tracking ID</label>
              <Input
                style={
                  {
                    WebkitTextSecurity: 'disc',
                  } as any
                }
                name="googleAnalyticsTrackingId"
                defaultValue={appConfiguration.analytics.google_analytics_tracking_id}
                title="Google Analytics Tracking ID"
                placeholder="Example: UA-123456789-1"
                disabled={!canUpdate}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <LoadingButton isLoading={pending} disabled={!canUpdate} type="submit">
            {t('shared.save')}
          </LoadingButton>
        </div>
      </form>
    </IndexPageLayout>
  )
}
