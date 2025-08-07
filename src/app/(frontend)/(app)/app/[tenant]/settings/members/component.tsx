'use client'

import useAppData from '@/lib/state/useAppData'
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useActionState, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { actionAppSettingsMembersLayout, AppSettingsMembersLoaderData } from './layout'
import ErrorModal, { RefErrorModal } from '@/components/ui/modals/ErrorModal'
import { RoleModel, RoleWithPermissionsDto, UserWithRolesDto } from '@/db/models'
import toast from 'react-hot-toast'
import ButtonPrimary from '@/components/ui/buttons/ButtonPrimary'
import InputSearch from '@/components/ui/input/InputSearch'
import IndexPageLayout from '@/components/ui/layouts/IndexPageLayout'
import Modal from '@/components/ui/modals/Modal'
import SettingSection from '@/components/ui/sections/SettingSection'
import SlideOverWideEmpty from '@/components/ui/slideOvers/SlideOverWideEmpty'
import TableSimple from '@/components/ui/tables/TableSimple'
import UrlUtils from '@/lib/utils/UrlUtils'
import MemberInvitationsListAndTable from '@/modules/accounts/components/members/MemberInvitationsListAndTable'
import RoleBadge from '@/modules/permissions/components/RoleBadge'
import RolesAndPermissionsMatrix from '@/modules/permissions/components/RolesAndPermissionsMatrix'
import UserRolesTable from '@/modules/permissions/components/UserRolesTable'

export default function ({
  data,
  children,
}: {
  data: AppSettingsMembersLoaderData
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const appData = useAppData()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()

  const [actionData, action, pending] = useActionState(actionAppSettingsMembersLayout, null)

  const errorModal = useRef<RefErrorModal>(null)

  const [searchInput, setSearchInput] = useState('')

  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissionsDto>()
  const [showRolesAndPermissions, setShowRolesAndPermissions] = useState(false)

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success)
    } else if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  useEffect(() => {
    setPermissionsModalOpen(selectedRole !== undefined)
  }, [selectedRole])

  useEffect(() => {
    if (!permissionsModalOpen) {
      setSelectedRole(undefined)
    }
  }, [permissionsModalOpen])

  const filteredItems = () => {
    if (!data.users) {
      return []
    }
    return data.users
      .filter(
        (f) =>
          f.user.first_name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
          f.user.last_name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
          f.user.email?.toString().toUpperCase().includes(searchInput.toUpperCase()),
      )
      .sort((x, y) => {
        return x.createdAt > y.createdAt ? -1 : 1
      })
  }

  function onSetRole(item: UserWithRolesDto, role: RoleModel, add: any) {
    const form = new FormData()
    form.set('action', 'edit')
    form.set('user-id', item.id)
    form.set('role-id', role.id)
    form.set('add', add ? 'true' : 'false')
    action(form)
  }

  return (
    <IndexPageLayout>
      <SettingSection
        size="lg"
        title={t('settings.members.title')}
        description={
          <div className="flex flex-col space-y-1">
            <div>Manage team members.</div>
            <div>
              <button
                type="button"
                className="text-left underline"
                onClick={() => setShowRolesAndPermissions(true)}
              >
                View all roles and permissions
              </button>
            </div>
          </div>
        }
        className="p-1"
      >
        <div className="space-y-2">
          <div className="flex justify-between space-x-2">
            <InputSearch value={searchInput} onChange={setSearchInput} />
            <ButtonPrimary to={UrlUtils.currentTenantUrl(params, 'settings/members/new')}>
              {t('shared.new')}
            </ButtonPrimary>
          </div>
          <div className="space-y-2">
            <UserRolesTable
              items={filteredItems().map((f) => f.user)}
              roles={data.roles}
              onChange={onSetRole}
              tenantId={appData.currentTenant.id}
              disabled={false}
              onRoleClick={(role) => setSelectedRole(role)}
              actions={{
                onEditRoute: (item) => {
                  const tenantUser = data.users?.find((f) => f.user.id === item.id)
                  return UrlUtils.currentTenantUrl(
                    params,
                    `settings/members/edit/${tenantUser?.id}`,
                  )
                },
              }}
            />

            <Modal open={permissionsModalOpen} setOpen={setPermissionsModalOpen}>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between space-x-2">
                  <h4 className="text-lg font-bold">{selectedRole?.name}</h4>
                  <p className="text-sm text-gray-500">
                    {selectedRole?.permissions.length}{' '}
                    {t('models.permission.plural')?.toLowerCase()}
                  </p>
                </div>
                <div className="h-96 max-h-96 overflow-y-scroll p-1">
                  <TableSimple
                    headers={[
                      {
                        name: 'name',
                        title: t('models.permission.name'),
                        // value: (i) => i.permission.name,
                        value: (i) => <RoleBadge item={i.permission} />,
                      },
                      {
                        name: 'description',
                        title: t('models.permission.description'),
                        value: (i) => i.permission.description,
                      },
                    ]}
                    items={selectedRole?.permissions ?? []}
                  />
                </div>
              </div>
            </Modal>

            <Modal size="4xl" open={showRolesAndPermissions} setOpen={setShowRolesAndPermissions}>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between space-x-2">
                  <h4 className="text-lg font-bold">Roles and Permissions</h4>
                  <p className="text-sm text-gray-500">
                    {data.permissions.length} {t('models.permission.plural')?.toLowerCase()}
                  </p>
                </div>
                <div className="p-1">
                  <RolesAndPermissionsMatrix
                    roles={data.roles}
                    permissions={data.permissions}
                    className="h-96 max-h-96 overflow-y-scroll"
                  />
                </div>
              </div>
            </Modal>

            {data.pendingInvitations.length > 0 && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Pending Invitations
                </label>
                <MemberInvitationsListAndTable
                  appUrl={data.appUrl}
                  items={data.pendingInvitations}
                  canDelete={true}
                  serverAction={{ actionData, action, pending }}
                />
              </div>
            )}
          </div>
        </div>
      </SettingSection>

      {children}
      {/* <SlideOverWideEmpty
        title={params?.id ? "Edit Member" : "New Member"}
        open={!!children}
        onClose={() => {
          // navigate(".", { replace: true });
          router.replace(pathname);
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{children}</div>
        </div>
      </SlideOverWideEmpty> */}

      <ErrorModal ref={errorModal} />
    </IndexPageLayout>
  )
}
