'use client'

import ButtonTertiary from '@/components/ui/buttons/ButtonTertiary'
import UploadFile from '@/components/ui/uploaders/UploadFile'
import useAdminData from '@/lib/state/useAdminData'
import { useRouter } from 'next/navigation'
import { useRef, useEffect, useState, useActionState } from 'react'
import { useTranslation } from 'react-i18next'
import { actionAdminProfile } from './actions'
import { languages } from '@/i18n/settings'
import i18next from 'i18next'
import LoadingButton from '@/components/ui/buttons/LoadingButton'

export default function () {
  const adminData = useAdminData()
  const router = useRouter()
  const [actionData, action, pending] = useActionState(actionAdminProfile, null)
  const { t, i18n } = useTranslation()

  const inputFirstName = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputFirstName.current?.focus()
    inputFirstName.current?.select()
  }, [])

  const [avatar, setAvatar] = useState<string | undefined>(adminData.user?.avatar ?? undefined)
  const [uploadingImage, setUploadingImage] = useState(false)

  function onChangedLocale(lang: string) {
    i18next.changeLanguage(lang)
    router.refresh()
  }

  function loadedImage(image: string | undefined) {
    setAvatar(image)
    setUploadingImage(true)
  }

  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('settings.admin.profile.title')}
        </h1>

        <div>
          {/*Profile */}
          <div className="grid gap-6">
            <div className="md:col-span-1">
              <div className="sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-foreground">
                  {t('settings.profile.profileTitle')}
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  {t('settings.profile.profileText')}
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form action={action}>
                <input hidden type="text" name="action" value="profile" readOnly />
                <div className="">
                  <div className="">
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-6 sm:col-span-6 md:col-span-6">
                        <label
                          htmlFor="email_address"
                          className="block text-sm font-medium leading-5 text-gray-700"
                        >
                          {t('account.shared.email')}
                        </label>
                        <input
                          required
                          disabled={true}
                          type="email"
                          id="email-address"
                          name="email"
                          defaultValue={adminData.user?.email}
                          className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium leading-5 text-gray-700"
                        >
                          {t('settings.profile.firstName')}
                        </label>
                        <input
                          ref={inputFirstName}
                          id="firstName"
                          name="firstName"
                          required
                          defaultValue={adminData.user?.firstName}
                          aria-invalid={Boolean(actionData?.fieldErrors?.firstName)}
                          aria-errormessage={
                            actionData?.fieldErrors?.firstName ? 'firstName-error' : undefined
                          }
                          className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                        />
                        {actionData?.fieldErrors?.firstName ? (
                          <p
                            className="py-2 text-xs text-rose-500"
                            role="alert"
                            id="firstName-error"
                          >
                            {actionData.fieldErrors.firstName}
                          </p>
                        ) : null}
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium leading-5 text-gray-700"
                        >
                          {t('settings.profile.lastName')}
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          defaultValue={adminData.user?.lastName}
                          aria-invalid={Boolean(actionData?.fieldErrors?.lastName)}
                          aria-errormessage={
                            actionData?.fieldErrors?.lastName ? 'lastName-error' : undefined
                          }
                          className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                        />
                        {actionData?.fieldErrors?.lastName ? (
                          <p
                            className="py-2 text-xs text-rose-500"
                            role="alert"
                            id="lastName-error"
                          >
                            {actionData.fieldErrors.lastName}
                          </p>
                        ) : null}
                      </div>

                      <div className="col-span-6 sm:col-span-6">
                        <label
                          htmlFor="avatar"
                          className="block text-sm font-medium leading-5 text-gray-700"
                        >
                          {t('shared.avatar')}
                        </label>
                        <div className="mt-2 flex items-center space-x-3">
                          <input
                            hidden
                            id="avatar"
                            name="avatar"
                            defaultValue={avatar ?? actionData?.fields?.avatar}
                          />
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                            {(() => {
                              if (avatar) {
                                return <img id="avatar" alt="Avatar" src={avatar} />
                              } else {
                                return (
                                  <svg
                                    id="avatar"
                                    className="h-full w-full text-gray-300"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                )
                              }
                            })()}
                          </div>

                          {avatar ? (
                            <ButtonTertiary
                              destructive={true}
                              onClick={() => loadedImage('')}
                              type="button"
                            >
                              {t('shared.delete')}
                            </ButtonTertiary>
                          ) : (
                            <UploadFile
                              accept="image/png, image/jpg, image/jpeg"
                              description=""
                              className="h-12"
                              onDropped={loadedImage}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <div className="flex justify-between">
                      <div id="form-success-message" className="flex items-center space-x-2">
                        {actionData?.profileSuccess ? (
                          <>
                            <p className="py-2 text-sm text-teal-500" role="alert">
                              {actionData.profileSuccess}
                            </p>
                          </>
                        ) : actionData?.profileError ? (
                          <p className="py-2 text-sm text-red-500" role="alert">
                            {actionData?.profileError}
                          </p>
                        ) : null}
                      </div>
                      <LoadingButton
                        actionName="profile"
                        type="submit"
                        className="inline-flex items-center space-x-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        {t('shared.save')}
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/*Separator */}
          <div className="block">
            <div className="py-5">{/* <div className="border-t border-border"></div> */}</div>
          </div>

          {/*Security */}
          <div className="grid gap-6">
            <div className="md:col-span-1">
              <div className="sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-foreground">
                  {t('settings.profile.securityTitle')}
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  {t('account.login.forgot')}{' '}
                  <a
                    className="text-theme-600 hover:text-theme-500 font-bold"
                    href={'/forgot-password?e=' + adminData.user?.email || ''}
                  >
                    {t('account.reset.button')}
                  </a>
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form action={action}>
                <input hidden type="text" name="action" value="password" readOnly />
                <div className="">
                  <div>
                    <div className="">
                      <div className="grid grid-cols-6 gap-2">
                        <div className="col-span-6 sm:col-span-6">
                          <label
                            htmlFor="passwordCurrent"
                            className="block text-sm font-medium leading-5 text-gray-700"
                          >
                            {t('settings.profile.passwordCurrent')}
                          </label>
                          <input
                            required
                            type="password"
                            id="passwordCurrent"
                            name="passwordCurrent"
                            className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-3">
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium leading-5 text-gray-700"
                          >
                            {t('settings.profile.password')}
                          </label>
                          <input
                            required
                            type="password"
                            id="passwordNew"
                            name="passwordNew"
                            className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-3">
                          <label
                            htmlFor="passwordConfirm"
                            className="block text-sm font-medium leading-5 text-gray-700"
                          >
                            {t('settings.profile.passwordConfirm')}
                          </label>
                          <input
                            required
                            type="password"
                            id="passwordNewConfirm"
                            name="passwordNewConfirm"
                            className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="flex justify-between space-x-2">
                        <div id="form-success-message" className="flex items-center space-x-2">
                          {actionData?.passwordSuccess ? (
                            <p className="py-2 text-sm text-teal-500" role="alert">
                              {actionData.passwordSuccess}
                            </p>
                          ) : actionData?.passwordError ? (
                            <p className="py-2 text-sm text-red-500" role="alert">
                              {actionData?.passwordError}
                            </p>
                          ) : null}
                        </div>
                        <LoadingButton
                          actionName="password"
                          type="submit"
                          className="inline-flex items-center space-x-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          {t('shared.save')}
                        </LoadingButton>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/*Separator */}
          <div className="block">
            <div className="py-5">{/* <div className="border-t border-border"></div> */}</div>
          </div>

          {/*Preferences */}
          <div className="grid gap-6">
            <div className="md:col-span-1">
              <div className="sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-foreground">
                  {t('settings.preferences.title')}
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  {t('settings.preferences.description')}
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <div className="">
                <div className="">
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-6 sm:col-span-6">
                      <label
                        htmlFor="locale"
                        className="block text-sm font-medium leading-5 text-gray-700"
                      >
                        {t('settings.preferences.language')}
                      </label>
                      <select
                        id="locale"
                        required
                        value={i18n.language}
                        onChange={(e) => onChangedLocale(e.currentTarget.value)}
                        className="focus:border-theme-500 focus:ring-theme-500 mt-1 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm"
                      >
                        {languages.map((locale, idx) => {
                          return (
                            <option key={idx} value={locale}>
                              {t('shared.locales.' + locale)}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*Separator */}
          <div className="block">
            <div className="py-5">{/* <div className="border-t border-border"></div> */}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
