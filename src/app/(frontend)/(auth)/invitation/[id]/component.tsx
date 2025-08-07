'use client'

import { useTranslation } from 'react-i18next'
import { actionInvitation, InvitationLoaderData } from './page'
import { useActionState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/components/brand/Logo'
import Link from 'next/link'
import LoadingButton from '@/components/ui/buttons/LoadingButton'

export default function ({ data }: { data: InvitationLoaderData }) {
  const [actionData, action, pending] = useActionState(actionInvitation, null)
  const { t } = useTranslation()

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div>
      <div>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Logo className="mx-auto h-12 w-auto" />
          </div>
          {(() => {
            if (!data.invitation) {
              return <div className="text-center text-red-500">{t('shared.invalidInvitation')}</div>
            } else {
              return (
                <div>
                  <h2 className="mt-6 text-center text-lg font-extrabold text-gray-800 dark:text-slate-200">
                    {t('shared.hi')}{' '}
                    {data.invitation.first_name
                      ? data.invitation.first_name
                      : data.invitation.email}
                    , {t('account.invitation.youWereInvited')} {data.invitation.tenant.name}
                  </h2>
                  <p className="max-w mt-2 text-center text-sm leading-5 text-gray-500">
                    {t('account.register.alreadyRegistered')}{' '}
                    <span className="font-medium text-primary hover:underline">
                      <Link href="/login">{t('account.register.clickHereToLogin')}</Link>
                    </span>
                  </p>

                  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="px-4 py-8 sm:rounded-sm sm:px-10">
                      <form action={action} className="sm:w-96">
                        <input
                          type="hidden"
                          name="invitationId"
                          value={data.invitation.id}
                          hidden
                          readOnly
                        />
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium leading-5">
                            {t('account.shared.email')}
                          </label>
                          <div className="mt-1 rounded-sm shadow-sm">
                            <input
                              disabled={true}
                              type="email"
                              id="email"
                              name="email"
                              defaultValue={data.invitation.email}
                              required
                              className="focus:border-theme-500 focus:ring-theme-500 relative block w-full appearance-none rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-slate-200 sm:text-sm"
                            />
                          </div>
                        </div>
                        {!data.existingUser && (
                          <>
                            <div className="mt-6">
                              <label
                                htmlFor="password"
                                className="block text-sm font-medium leading-5"
                              >
                                {t('account.shared.password')}
                              </label>
                              <div className="mt-1 rounded-sm shadow-sm">
                                <input
                                  type="password"
                                  id="password"
                                  name="password"
                                  required
                                  className="focus:border-theme-500 focus:ring-theme-500 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                                />
                              </div>
                            </div>
                            <div className="mt-6">
                              <label
                                htmlFor="password-confirm"
                                className="block text-sm font-medium leading-5"
                              >
                                {t('account.register.confirmPassword')}
                              </label>
                              <div className="mt-1 rounded-sm shadow-sm">
                                <input
                                  type="password"
                                  id="password-confirm"
                                  name="password-confirm"
                                  required
                                  className="focus:border-theme-500 focus:ring-theme-500 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="mt-6">
                          <span className="block w-full rounded-sm shadow-sm">
                            <LoadingButton className="block w-full" type="submit">
                              {t('account.invitation.button')}
                            </LoadingButton>
                          </span>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )
            }
          })()}
        </div>
      </div>
    </div>
  )
}
