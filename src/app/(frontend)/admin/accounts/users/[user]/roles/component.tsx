'use client'

import { useTranslation } from 'react-i18next'
import { actionAdminUsersEditRoles, AdminUsersEditRolesLoaderData } from './page'
import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ButtonSecondary from '@/components/ui/buttons/ButtonSecondary'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import SlideOverWideEmpty from '@/components/ui/slideOvers/SlideOverWideEmpty'
import { Checkbox } from '@/components/ui/checkbox'

export default function ({ data }: { data: AdminUsersEditRolesLoaderData }) {
  const { t } = useTranslation()
  const [actionData, action, pending] = useActionState(actionAdminUsersEditRoles, null)
  const router = useRouter()

  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    data.user.roles?.filter((f) => f.role.type === 'admin').map((r) => r.role_id),
  )

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  function hasSomeAdminRoles() {
    return data.adminRoles.some((ar) => selectedRoles?.includes(ar.id))
  }
  function hasAllAdminRoles() {
    return data.adminRoles.every((ar) => selectedRoles?.includes(ar.id))
  }

  return (
    <div>
      <SlideOverWideEmpty
        open={true}
        onClose={() => {
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
              <input type="hidden" name="action" value="set-user-roles" hidden readOnly />
              <input type="hidden" name="userEmail" value={data.user.email} hidden readOnly />
              {selectedRoles?.map((role, idx) => {
                return (
                  <input
                    key={idx}
                    type="hidden"
                    name="roles[]"
                    value={JSON.stringify({
                      id: role,
                      tenantId: undefined,
                    })}
                  />
                )
              })}

              <div className="flex items-center justify-between space-x-2 border-b border-gray-200 pb-2">
                <div className="text-lg font-medium text-gray-700">{t('models.role.plural')}</div>
                <div className="flex items-center space-x-2">
                  <ButtonSecondary
                    disabled={!hasSomeAdminRoles()}
                    onClick={() => setSelectedRoles([])}
                  >
                    {t('shared.clear')}
                  </ButtonSecondary>

                  <ButtonSecondary
                    disabled={hasAllAdminRoles()}
                    onClick={() => setSelectedRoles(data.adminRoles.map((r) => r.id))}
                  >
                    {t('shared.selectAll')}
                  </ButtonSecondary>
                </div>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                {data.adminRoles?.map((role, idx) => (
                  // <InputCheckboxWithDescription
                  //   key={idx}
                  //   name={role.name}
                  //   title={role.name}
                  //   description={role.description}
                  //   defaultValue={selectedRoles.includes(role.id)}
                  //   onChange={(e) => {
                  //     if (e) {
                  //       setSelectedRoles((f) => [...f, role.id]);
                  //     } else {
                  //       setSelectedRoles((f) => f.filter((f) => f !== role.id));
                  //     }
                  //   }}
                  // />
                  <div key={idx} className="items-top flex space-x-2 py-2">
                    <Checkbox
                      id={role.name}
                      name={role.name}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(e: any) => {
                        if (e) {
                          setSelectedRoles((f) => [...f, role.id])
                        } else {
                          setSelectedRoles((f) => f.filter((f) => f !== role.id))
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={role.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {role.name}
                      </label>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                ))}
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
