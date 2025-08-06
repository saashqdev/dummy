'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TableSimple, { RowHeaderDisplayDto } from '@/components/ui/tables/TableSimple'
import RoleBadge from './RoleBadge'
import { PermissionWithRolesDto } from '@/db/models'

interface Props {
  items: PermissionWithRolesDto[]
  canUpdate: boolean
}

export default function PermissionsTable({ items, canUpdate = true }: Props) {
  const { t } = useTranslation()

  const [actions, setActions] = useState<any[]>([])
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<PermissionWithRolesDto>[]>([])

  useEffect(() => {
    if (canUpdate) {
      setActions([
        {
          title: t('shared.edit'),
          onClickRoute: (_: any, item: any) =>
            `/admin/accounts/roles-and-permissions/permissions/${item.id}`,
        },
      ])
    }

    const headers: RowHeaderDisplayDto<PermissionWithRolesDto>[] = [
      {
        name: 'name',
        title: t('models.permission.name'),
        // value: (i) => i.name,
        value: (i) => <RoleBadge item={i} />,
        className: 'max-w-xs truncate',
      },
      {
        name: 'description',
        title: t('models.permission.description'),
        value: (i) => i.description,
        className: 'max-w-xs truncate',
      },
      {
        name: 'roles',
        title: t('models.permission.in_roles'),
        // value: (i) => i.in_roles.length,
        value: (i) => (
          <div className="w-64 truncate">
            <span className="max-w-sm truncate text-sm italic">
              {i.in_roles
                .sort((a, b) => a.role.order - b.role.order)
                .map((f) => f.role.name)
                .join(', ')}
            </span>
          </div>
        ),
        className: canUpdate ? 'max-w-xs truncate' : '',
      },
    ]

    setHeaders(headers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUpdate])

  return (
    <div>
      <TableSimple actions={actions} headers={headers} items={items} />
    </div>
  )
}
