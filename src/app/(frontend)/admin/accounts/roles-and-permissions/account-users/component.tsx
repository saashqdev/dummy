'use client'

import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { AdminAccountUsersLoaderData } from './page'
import InputSearch from '@/components/ui/input/InputSearch'
import TableSimple from '@/components/ui/tables/TableSimple'
import DateUtils from '@/lib/utils/DateUtils'

export default function ({ data }: { data: AdminAccountUsersLoaderData }) {
  const { t } = useTranslation()

  const [searchInput, setSearchInput] = useState('')

  const filteredItems = () => {
    if (!data.tenants) {
      return []
    }
    return data.tenants.filter(
      (f) =>
        f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.users.find(
          (x) =>
            x.user.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.user.first_name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.user.last_name?.toString().toUpperCase().includes(searchInput.toUpperCase()),
        ),
    )
  }

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} onChange={setSearchInput} />
      <TableSimple
        items={filteredItems()}
        headers={[
          {
            name: 'tenant',
            title: t('models.tenant.object'),
            value: (i) => (
              <div className="max-w-sm truncate">
                <div className="flex items-center space-x-1 truncate font-medium text-gray-800">
                  {i.name}
                </div>

                <div className="text-xs text-gray-500">
                  <span>/{i.slug}</span>
                </div>
              </div>
            ),
          },
          {
            name: 'users',
            title: t('models.user.plural'),
            className: 'max-w-xs truncate',
            value: (i) => i.users.map((f) => f.user.email).join(', '),
            href: (i) => `/admin/accounts/users?tenantId=${i.id}`,
          },
          {
            name: 'createdAt',
            title: t('shared.createdAt'),
            // value: (i) => i.createdAt,
            value: (item) => (
              <div className="flex flex-col">
                <div>{DateUtils.dateYMD(item.createdAt)}</div>
                <div className="text-xs">{DateUtils.dateAgo(item.createdAt)}</div>
              </div>
            ),
          },
        ]}
        actions={[
          {
            title: t('shared.setUserRoles'),
            onClickRoute: (_, item) =>
              `/admin/accounts/roles-and-permissions/account-users/${item.id}`,
          },
        ]}
      />
    </div>
  )
}
