'use client'

import { useTranslation } from 'react-i18next'
import { useActionState, useEffect } from 'react'
import Logo from '@/components/brand/Logo'
import Link from 'next/link'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import { Input } from '@/components/ui/input'
import ExclamationTriangleIcon from '@/components/ui/icons/ExclamationTriangleIcon'
import { actionAuthReset } from './page'
import toast from 'react-hot-toast'

export default function ({
  data,
}: {
  data: {
    email: string
    verify_token: string
  }
}) {
  const { t } = useTranslation()
  const [actionData, action, pending] = useActionState(actionAuthReset, null)

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success)
    } else if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />
          <div className="flex flex-col items-center">
            <div className="text-left text-2xl font-extrabold">
              {t('account.newPassword.title')}
            </div>
            <div className="mt-1 text-left">
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t('account.register.clickHereToLogin')}
              </Link>
            </div>
          </div>

          <div className="mx-auto flex flex-col items-center space-y-6 rounded-lg border border-border p-6">
            <form action={action} className="w-full space-y-3">
              <input
                type="hidden"
                name="verify-token"
                defaultValue={data.verify_token}
                required
                hidden
                readOnly
              />
              <div>
                <label htmlFor="email" className="mb-1 text-xs font-medium">
                  {t('account.shared.email')} <span className="text-red-500">*</span>
                </label>
                <Input
                  title={t('account.shared.email')}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@address.com"
                  readOnly
                  defaultValue={data.email}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 text-xs font-medium">
                  {t('account.shared.password')} <span className="text-red-500">*</span>
                </label>
                <Input
                  title={t('account.shared.password')}
                  autoFocus
                  id="password"
                  name="password"
                  type="password"
                  placeholder="************"
                  readOnly={!data.email}
                  defaultValue=""
                  required
                />
              </div>
              <div>
                <label htmlFor="password-confirm" className="mb-1 text-xs font-medium">
                  {t('account.register.confirmPassword')} <span className="text-red-500">*</span>
                </label>
                <Input
                  title={t('account.register.confirmPassword')}
                  name="password-confirm"
                  type="password"
                  placeholder="************"
                  readOnly={!data.email}
                  defaultValue=""
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <LoadingButton disabled={!data.email} className="w-full" type="submit">
                  {t('account.newPassword.button')}
                </LoadingButton>
              </div>
              <div id="form-error-message">
                {actionData?.error && !pending ? (
                  <div
                    className="flex items-center justify-center space-x-2 text-sm text-red-500 dark:text-red-300"
                    role="alert"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <div>{actionData.error}</div>
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
