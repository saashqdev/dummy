'use client'

import SlideOverWideEmpty from '@/components/ui/slideOvers/SlideOverWideEmpty'
import { useParams, useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef } from 'react'
import { actionAppSettingsMembersEdit, AppSettingsMembersEditLoaderData } from './page'
import { useTranslation } from 'react-i18next'
import useAppData from '@/lib/state/useAppData'
import toast from 'react-hot-toast'
import UrlUtils from '@/lib/utils/UrlUtils'
import { Input } from '@/components/ui/input'
import ButtonSecondary from '@/components/ui/buttons/ButtonSecondary'
import { getUserHasPermission } from '@/lib/helpers/PermissionsHelper'
import clsx from 'clsx'
import ConfirmModal, { RefConfirmModal } from '@/components/ui/modals/ConfirmModal'

export default function ({ data }: { data: AppSettingsMembersEditLoaderData }) {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const appData = useAppData()

  const [actionData, action, pending] = useActionState(actionAppSettingsMembersEdit, null)

  const confirmRemove = useRef<RefConfirmModal>(null)

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  function close() {
    router.push(UrlUtils.currentTenantUrl(params, 'settings/members'))
  }
  function remove() {
    if (!data.member) {
      return
    }
    confirmRemove.current?.show(
      t('shared.confirmRemove'),
      t('shared.remove'),
      t('shared.cancel'),
      t('settings.members.actions.removeConfirm', { 0: data.member?.user.email }),
    )
  }
  function yesRemove() {
    if (appData.isSuperUser) {
      toast.error(t('account.tenant.onlyAdmin'))
    } else {
      const form = new FormData()
      form.set('action', 'delete')
      form.set('id', data.member.id.toString())
      action(form)
    }
  }

  return (
    <SlideOverWideEmpty
      title={'Member'}
      open={true}
      onClose={() => {
        router.replace(`/app/${params.tenant}/settings/members`)
      }}
      className="sm:max-w-sm"
      overflowYScroll={true}
    >
      <div className="-mx-1 -mt-3">
        <div className="space-y-4">
          <div>
            {(() => {
              if (!data.member) {
                return <div>{t('shared.notFound')}</div>
              } else if (data.member) {
                return (
                  <form action={action} method="post" className="space-y-4">
                    <input hidden type="text" name="action" value="edit" readOnly />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="mb-1 text-xs font-medium">{t('models.user.email')}</label>
                        <Input
                          disabled
                          name="email"
                          title={t('models.user.email')}
                          autoComplete="off"
                          readOnly
                          defaultValue={data.member?.user.email}
                        />
                      </div>
                      {/*Email: End */}

                      {/*User First Name */}
                      <div>
                        <label className="mb-1 text-xs font-medium">
                          {t('models.user.first_name')}
                        </label>
                        <Input
                          type="text"
                          disabled
                          name="first-name"
                          title={t('models.user.first_name')}
                          autoComplete="off"
                          readOnly
                          defaultValue={data.member?.user.first_name}
                        />
                      </div>
                      {/*User First Name: End */}

                      {/*User Last Name */}
                      <div>
                        <label className="mb-1 text-xs font-medium">
                          {t('models.user.last_name')}
                        </label>
                        <Input
                          disabled
                          type="text"
                          title={t('models.user.last_name')}
                          name="last-name"
                          autoComplete="off"
                          readOnly
                          defaultValue={data.member?.user.last_name}
                        />
                      </div>

                      {/*User Last Name: End */}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {(() => {
                        if (pending) {
                          return (
                            <div className="text-theme-700 text-sm">
                              <div>{t('shared.loading')}...</div>
                            </div>
                          )
                        } else {
                          return (
                            <div>
                              <ButtonSecondary
                                destructive
                                disabled={
                                  !getUserHasPermission(appData, 'app.settings.members.delete')
                                }
                                onClick={remove}
                                isLoading={pending}
                              >
                                <div>{t('shared.remove')}</div>
                              </ButtonSecondary>
                            </div>
                          )
                        }
                      })()}

                      <div className="flex items-center space-x-2">
                        <ButtonSecondary
                          disabled={pending}
                          className={clsx(
                            'focus:ring-theme-500 inline-flex items-center space-x-2 border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:rounded-md sm:text-sm',
                            pending && 'cursor-not-allowed bg-gray-100',
                          )}
                          type="button"
                          onClick={close}
                        >
                          <div>{t('shared.cancel')}</div>
                        </ButtonSecondary>
                        {/* <ButtonPrimary disabled={loading || !getUserHasPermission( appData,"app.settings.members.update")} type="submit">
                    <div>{t("shared.save")}</div>
                  </ButtonPrimary> */}
                      </div>
                    </div>
                  </form>
                )
              } else {
                return <div></div>
              }
            })()}

            <ConfirmModal ref={confirmRemove} onYes={yesRemove} destructive />
          </div>
        </div>
      </div>
    </SlideOverWideEmpty>
  )
}
