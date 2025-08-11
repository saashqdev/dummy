'use client'

import clsx from 'clsx'
import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PlanFeatureUsageDto } from '@/modules/subscriptions/dtos/PlanFeatureUsageDto'
import UrlUtils from '@/lib/utils/UrlUtils'
import CheckPlanFeatureLimit from '@/modules/subscriptions/components/CheckPlanFeatureLimit'
import InputCheckboxWithDescription from '@/components/ui/input/InputCheckboxWithDescription'
import toast from 'react-hot-toast'
import { IServerAction } from '@/lib/dtos/ServerComponentsProps'
import { useParams, useRouter } from 'next/navigation'

interface Props {
  featurePlanUsage: PlanFeatureUsageDto | undefined
  serverAction: IServerAction
}

export default function NewMember({ featurePlanUsage, serverAction }: Props) {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()

  const loading = serverAction.pending

  const inputEmail = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (serverAction.actionData?.success) {
      toast.success(serverAction.actionData.success)
    } else if (serverAction.actionData?.error) {
      toast.error(serverAction.actionData.error)
    }
  }, [serverAction.actionData])

  useEffect(() => {
    // nextTick(() => {
    if (inputEmail.current) {
      inputEmail.current?.focus()
      inputEmail.current?.select()
    }
    // });
  }, [])

  function close() {
    router.push(UrlUtils.currentTenantUrl(params, 'settings/members'))
  }

  return (
    <CheckPlanFeatureLimit item={featurePlanUsage}>
      <form action={serverAction.action} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {/*Email */}
          <div className="col-span-2">
            <label htmlFor="email" className="block truncate text-xs font-medium text-gray-700">
              <div className="flex space-x-1 truncate">
                <div>{t('models.user.email')}</div>
                <div className="ml-1 text-red-500">*</div>
              </div>
            </label>
            <div className="mt-1 flex w-full rounded-md shadow-sm">
              <input
                type="email"
                ref={inputEmail}
                name="email"
                id="email"
                autoComplete="off"
                required
                defaultValue=""
                disabled={loading}
                className={clsx(
                  'focus:border-theme-500 focus:ring-theme-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 lowercase sm:text-sm',
                  loading && 'cursor-not-allowed bg-gray-100',
                )}
              />
            </div>
          </div>
          {/*Email: End */}

          {/*User First Name */}
          <div>
            <label
              htmlFor="first-name"
              className="block truncate text-xs font-medium text-gray-700"
            >
              <div className="flex space-x-1 truncate">
                <div>{t('models.user.firstName')}</div>
                <div className="ml-1 text-red-500">*</div>
              </div>
            </label>
            <div className="mt-1 flex w-full rounded-md shadow-sm">
              <input
                type="text"
                id="first-name"
                name="first-name"
                autoComplete="off"
                required
                defaultValue=""
                className={clsx(
                  'focus:border-theme-500 focus:ring-theme-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm',
                  loading && 'cursor-not-allowed bg-gray-100',
                )}
              />
            </div>
          </div>
          {/*User First Name: End */}

          {/*User Last Name */}
          <div>
            <label htmlFor="last-name" className="block truncate text-xs font-medium text-gray-700">
              {t('models.user.lastName')}
            </label>
            <div className="mt-1 flex w-full rounded-md shadow-sm">
              <input
                type="text"
                id="last-name"
                name="last-name"
                autoComplete="off"
                defaultValue=""
                className={clsx(
                  'focus:border-theme-500 focus:ring-theme-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm',
                  loading && 'cursor-not-allowed bg-gray-100',
                )}
              />
            </div>
          </div>
          {/*User Last Name: End */}

          <div className="col-span-2">
            <InputCheckboxWithDescription
              name="send-invitation-email"
              title="Send email"
              description="Send an invitation email to the user"
              defaultValue={false}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-theme-700 text-sm">
            {loading && <div>{t('shared.loading')}...</div>}
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={loading}
              className={clsx(
                'focus:ring-theme-500 inline-flex items-center space-x-2 border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:rounded-md sm:text-sm',
                loading && 'cursor-not-allowed bg-gray-100',
              )}
              type="button"
              onClick={close}
            >
              <div>{t('shared.cancel')}</div>
            </button>
            <button
              disabled={loading}
              className={clsx(
                'inline-flex items-center space-x-2 border border-transparent bg-primary px-3 py-2 font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:rounded-md sm:text-sm',
                loading && 'cursor-not-allowed opacity-50',
              )}
              type="submit"
            >
              <div>{t('shared.invite')}</div>
            </button>
          </div>
        </div>
      </form>
    </CheckPlanFeatureLimit>
  )
}
