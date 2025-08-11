'use client'

import { useTranslation } from 'react-i18next'
import { actionAdminUsersNew, AdminUsersNewLoaderData } from './page'
import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import InputCheckboxWithDescription from '@/components/ui/input/InputCheckboxWithDescription'
import ButtonSecondary from '@/components/ui/buttons/ButtonSecondary'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import SlideOverWideEmpty from '@/components/ui/slideOvers/SlideOverWideEmpty'

export default function ({ data }: { data: AdminUsersNewLoaderData }) {
  const [actionData, action, pending] = useActionState(actionAdminUsersNew, null)

  const { t } = useTranslation()
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [first_name, setFirstName] = useState<string>('')
  const [last_name, setLastName] = useState<string>('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div>
      <SlideOverWideEmpty
        open={true}
        onClose={() => {
          // navigate(".", { replace: true });
          router.replace('/admin/accounts/users')
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">
            <form
              action={action}
              className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle"
            >
              <input type="hidden" name="action" value="new-user" hidden readOnly />
              {selectedRoles?.map((role) => {
                return (
                  <input
                    key={role}
                    type="hidden"
                    name="roles[]"
                    value={JSON.stringify({
                      id: role,
                      tenantId: undefined,
                    })}
                  />
                )
              })}

              <div className="space-y-2">
                <div>
                  <label className="mb-1 text-xs font-medium">
                    {t('models.user.email')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    autoFocus
                    type="email"
                    name="email"
                    title={t('models.user.email')}
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 text-xs font-medium">
                    {t('account.shared.password')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    name="password"
                    title={t('account.shared.password')}
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 text-xs font-medium">
                    {' '}
                    {t('models.user.first_name')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="first_name"
                    title={t('models.user.first_name')}
                    value={first_name}
                    onChange={(e) => setFirstName(e.currentTarget.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 text-xs font-medium">{t('models.user.last_name')}</label>
                  <Input
                    name="last_name"
                    title={t('models.user.last_name')}
                    value={last_name}
                    onChange={(e) => setLastName(e.currentTarget.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium">
                    {t('models.role.plural')}
                  </label>
                  <div className="divide-y divide-gray-100 rounded-md border border-gray-300 bg-white px-2 py-1">
                    {data.adminRoles?.map((role) => (
                      <InputCheckboxWithDescription
                        key={role.name}
                        name={role.name}
                        title={role.name}
                        description={role.description}
                        defaultValue={selectedRoles.includes(role.id)}
                        onChange={(e) => {
                          if (e) {
                            setSelectedRoles((f) => [...f, role.id])
                          } else {
                            setSelectedRoles((f) => f.filter((f) => f !== role.id))
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <ButtonSecondary
                  type="button"
                  className="w-full"
                  onClick={() => router.push('/admin/accounts/users')}
                >
                  <div className="w-full text-center">{t('shared.back')}</div>
                </ButtonSecondary>
                <LoadingButton type="submit" disabled={pending} className="w-full">
                  {t('shared.save')}
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      </SlideOverWideEmpty>
    </div>
  )
}
