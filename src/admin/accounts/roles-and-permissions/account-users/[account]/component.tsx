'use client'

import { useTranslation } from 'react-i18next'
import { useActionState, useEffect, useState } from 'react'
import { actionAdminAccountUsersAccount, AdminAccountUsersAccountLoaderData } from './page'
import InputSearch from '@/components/ui/input/InputSearch'
import useAdminData from '@/lib/state/useAdminData'
import { useParams } from 'next/navigation'
import { RoleWithPermissionsDto, UserWithRolesDto } from '@/db/models'
import BreadcrumbSimple from '@/components/ui/breadcrumbs/BreadcrumbSimple'
import UserRolesTable from '@/modules/permissions/components/UserRolesTable'
import { getUserHasPermission } from '@/lib/helpers/PermissionsHelper'
import toast from 'react-hot-toast'

export default function ({ data }: { data: AdminAccountUsersAccountLoaderData }) {
  const [actionData, action, pending] = useActionState(actionAdminAccountUsersAccount, null)
  const adminData = useAdminData()
  const params = useParams()
  const items = data.items

  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success)
    } else if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  const filteredItems = () => {
    if (!items) {
      return []
    }
    return items.filter(
      (f) =>
        f.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.first_name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.last_name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.roles.find(
          (f) =>
            f.role.name.toUpperCase().includes(searchInput.toUpperCase()) ||
            f.role.description.toUpperCase().includes(searchInput.toUpperCase()),
        ),
    )
  }

  function onChange(item: UserWithRolesDto, role: RoleWithPermissionsDto, add: any) {
    const form = new FormData()
    form.set('action', 'edit')
    form.set('tenantId', params.account?.toString() ?? '')
    form.set('user-id', item.id)
    form.set('role-id', role.id)
    form.set('add', add ? 'true' : 'false')
    action(form)
  }

  return (
    <div className="space-y-2">
      <BreadcrumbSimple
        menu={[
          {
            title: 'App Users',
            routePath: '/admin/accounts/roles-and-permissions/account-users',
          },
          {
            title: data.tenant.name,
            routePath: '/admin/accounts/roles-and-permissions/account-users/' + data.tenant.id,
          },
        ]}
      />
      <InputSearch value={searchInput} onChange={setSearchInput} />
      <UserRolesTable
        items={filteredItems()}
        roles={data.roles}
        onChange={onChange}
        tenantId={params.account?.toString() ?? ''}
        disabled={!getUserHasPermission(adminData, 'admin.roles.set')}
      />
    </div>
  )
}
