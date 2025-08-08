'use client'

import useAdminData from '@/lib/state/useAdminData'
import { getUserHasPermission } from '@/lib/helpers/PermissionsHelper'
import { useActionState, useEffect, useState } from 'react'
import { actionAdminRolesAdminUsers, AdminRolesAdminUsersLoaderData } from './page'
import { RoleWithPermissionsDto, UserWithRolesDto } from '@/db/models'
import InputSearch from '@/components/ui/input/InputSearch'
import UserRolesTable from '@/modules/permissions/components/UserRolesTable'
import toast from 'react-hot-toast'

export default function ({
  data,
}: {
  data: AdminRolesAdminUsersLoaderData
  children: React.ReactNode
}) {
  const adminData = useAdminData()
  const [actionData, action, submit] = useActionState(actionAdminRolesAdminUsers, null)
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
    interface Tenant {
      tenant: {
        name: string
      }
    }

    interface Role {
      role: {
        name: string
        description: string
      }
    }

    interface UserItem {
      email?: string
      first_name?: string
      last_name?: string
      tenants: Tenant[]
      roles: Role[]
    }

    return items.filter(
      (f: UserItem) =>
        f.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.first_name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.last_name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.tenants.find((f: Tenant) =>
          f.tenant.name.toUpperCase().includes(searchInput.toUpperCase()),
        ) ||
        f.roles.find(
          (f: Role) =>
            f.role.name.toUpperCase().includes(searchInput.toUpperCase()) ||
            f.role.description.toUpperCase().includes(searchInput.toUpperCase()),
        ),
    )
  }

  function onChange(item: UserWithRolesDto, role: RoleWithPermissionsDto, add: any) {
    const form = new FormData()
    form.set('action', 'edit')
    form.set('user-id', item.id)
    form.set('role-id', role.id)
    form.set('add', add ? 'true' : 'false')
    action(form)
  }

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} onChange={setSearchInput} />
      <UserRolesTable
        items={filteredItems()}
        roles={data.roles}
        onChange={onChange}
        disabled={!getUserHasPermission(adminData, 'admin.roles.set')}
      />
    </div>
  )
}
