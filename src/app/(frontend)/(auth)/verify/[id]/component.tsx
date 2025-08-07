'use client'

import { useTranslation } from 'react-i18next'
import Logo from '@/components/brand/Logo'
import Link from 'next/link'
import { UserRegistrationAttemptModel } from '@/db/models'
import { RegisterForm } from '@/modules/accounts/components/auth/RegisterForm'
import { useActionState } from 'react'
import { actionVerify } from '@/modules/accounts/services/AuthService'

export default function ({
  data,
}: {
  data: { registration: UserRegistrationAttemptModel | null }
}) {
  const { t } = useTranslation()
  const [actionData, action, pending] = useActionState(actionVerify, null)

  return (
    <div className="bg-background">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          <Logo className="mx-auto h-12 w-auto" />

          {data.registration && !data.registration.created_tenant_id ? (
            <>
              <div>
                <h1 className="mt-6 text-center text-lg font-bold leading-9 text-gray-800 dark:text-slate-200">
                  {t('account.verify.title')}
                </h1>
                <p className="max-w mt-2 text-center text-sm leading-5 text-gray-800 dark:text-slate-200">
                  {t('account.register.alreadyRegistered')}{' '}
                  <span className="font-medium text-primary hover:underline">
                    <Link href="/login">{t('account.register.clickHereToLogin')}</Link>
                  </span>
                </p>
              </div>
              <RegisterForm
                isVerifyingEmail
                data={{
                  company: data.registration.company || undefined,
                  email: data.registration.email,
                  first_name: data.registration.first_name,
                  last_name: data.registration.last_name,
                }}
                verificationId={data.registration.token}
                serverAction={{ actionData, action, pending }}
              />
            </>
          ) : (
            <div>
              <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto mb-4 w-full max-w-md rounded-sm px-8 pb-8">
                  <div className="text-xl font-black">
                    <h1 className="mt-6 text-center text-lg font-extrabold">
                      {t('account.verify.title')}
                    </h1>
                  </div>
                  <div className="my-4 leading-tight">
                    <p className="max-w mt-2 text-center text-sm leading-5">
                      {t('account.verify.invalidLink')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
