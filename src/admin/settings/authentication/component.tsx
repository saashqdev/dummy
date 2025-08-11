'use client'

import { useActionState, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import { actionAuthenticationSettings } from './actions'
import useRootData from '@/lib/state/useRootData'
import toast from 'react-hot-toast'
import IndexPageLayout from '@/components/ui/layouts/IndexPageLayout'
import InputCheckboxWithDescription from '@/components/ui/input/InputCheckboxWithDescription'

export default function () {
  const { t } = useTranslation()
  const [actionData, action, pending] = useActionState(actionAuthenticationSettings, null)
  const { appConfiguration } = useRootData()
  const [canUpdate] = useState(true)

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success)
    } else if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <IndexPageLayout title={t('settings.admin.authentication.title')}>
      <form action={action} className="divide-y-gray-200 mt-6 space-y-8 divide-y">
        <input name="action" value="update" hidden readOnly />
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
          <div className="sm:col-span-6">
            <InputCheckboxWithDescription
              name="requireEmailVerification"
              defaultValue={appConfiguration.auth.require_email_verification}
              title="Require email verification"
              description="Users needs to verify their email before using the application"
              disabled={!canUpdate}
            />

            <InputCheckboxWithDescription
              name="requireOrganization"
              defaultValue={appConfiguration.auth.require_organization}
              title="Require organization"
              description="Organization name is required to register"
              disabled={!canUpdate}
            />

            <InputCheckboxWithDescription
              name="requireName"
              defaultValue={appConfiguration.auth.require_name}
              title="Require name"
              description="User name is required to register"
              disabled={!canUpdate}
            />

            <InputCheckboxWithDescription
              name="required"
              defaultValue={appConfiguration.subscription.required}
              title="Subscription required"
              description="Active subscription is required to use the application"
              disabled={!canUpdate}
            />

            <InputCheckboxWithDescription
              name="allowSubscribeBeforeSignUp"
              defaultValue={appConfiguration.subscription.allow_subscribe_before_sign_up}
              title="Allow subscription before sign up"
              description="Users can subscribe/buy before setting up their account"
              disabled={!canUpdate}
            />

            <InputCheckboxWithDescription
              name="allowSignUpBeforeSubscribe"
              defaultValue={appConfiguration.subscription.allow_sign_up_before_subscribe}
              title="Allow sign up without subscription"
              description="Users can register before subscribing/buying a plan"
              disabled={!canUpdate}
            />
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <LoadingButton isLoading={pending} type="submit" disabled={!canUpdate}>
            {t('shared.save')}
          </LoadingButton>
        </div>
      </form>
    </IndexPageLayout>
  )
}
