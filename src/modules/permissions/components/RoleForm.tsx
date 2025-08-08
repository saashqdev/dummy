'use client'

import { useTranslation } from 'react-i18next'
import InputCheckboxInline from '@/components/ui/input/InputCheckboxInline'
import { useEffect, useState } from 'react'
import ButtonTertiary from '@/components/ui/buttons/ButtonTertiary'
import InputRadioGroup from '@/components/ui/input/InputRadioGroup'
import InputSearch from '@/components/ui/input/InputSearch'
import { RoleWithPermissionsDto, PermissionWithRolesDto } from '@/db/models'
import { Input } from '@/components/ui/input'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import ButtonSecondary from '@/components/ui/buttons/ButtonSecondary'
import { IServerAction } from '@/lib/dtos/ServerComponentsProps'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  item?: RoleWithPermissionsDto
  permissions: PermissionWithRolesDto[]
  onCancel: () => void
  canUpdate?: boolean
  canDelete?: boolean
  serverAction: IServerAction
}

export default function RoleForm({
  item,
  permissions,
  onCancel,
  canUpdate = true,
  canDelete,
  serverAction,
}: Props) {
  const { t } = useTranslation()

  const [rolePermissions, setRolePermissions] = useState<string[]>([])
  const [type, setType] = useState<string | number | undefined>(item?.type ?? 'admin')
  const [assignToNewUsers, setAssignToNewUsers] = useState(item?.assign_to_new_users ?? false)

  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    setRolePermissions([])
  }, [type])

  useEffect(() => {
    const rolePermissions: string[] = []
    if (item) {
      item?.permissions.forEach((item) => {
        rolePermissions.push(item.permission.name)
      })
    }
    setRolePermissions(rolePermissions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function hasPermission(permission: PermissionWithRolesDto) {
    return rolePermissions.includes(permission.name)
  }

  function setPermission(permission: PermissionWithRolesDto, add: any) {
    if (add) {
      setRolePermissions([...rolePermissions, permission.name])
    } else {
      setRolePermissions(rolePermissions.filter((f) => f !== permission.name))
    }
  }

  const filteredItems = () => {
    if (!permissions.filter((f) => f.type === type)) {
      return []
    }
    return permissions
      .filter((f) => f.type === type)
      .filter(
        (f) =>
          f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
          f.description?.toString().toUpperCase().includes(searchInput.toUpperCase()),
      )
  }

  function onDelete() {
    const form = new FormData()
    form.set('action', 'delete')
    form.set('id', item?.id || '')
    serverAction.action(form)
  }

  return (
    <form action={serverAction.action} className="space-y-3 px-4 pb-4">
      <input type="hidden" name="action" value={item ? 'edit' : 'create'} readOnly hidden />
      {item && <input type="hidden" name="id" value={item.id} readOnly hidden />}
      <div className="text-lg font-bold text-gray-900">Role Details</div>

      <div>
        <label className="mb-1 text-xs font-medium">
          {t('models.role.name')} <span className="text-red-500">*</span>
        </label>
        <Input
          disabled={!canUpdate}
          required
          name="name"
          title={t('models.role.name')}
          defaultValue={item?.name}
        />
      </div>
      <div>
        <label className="mb-1 text-xs font-medium">
          {t('models.role.description')} <span className="text-red-500">*</span>
        </label>
        <Input
          disabled={!canUpdate}
          required
          name="description"
          title={t('models.role.description')}
          defaultValue={item?.description}
        />
      </div>

      <InputCheckboxInline
        disabled={!canUpdate}
        description={
          <span className="pl-1 font-light text-gray-500">
            {' '}
            - Every new user will have this role
          </span>
        }
        name="assign-to-new-users"
        title={t('models.role.assignToNewUsers')}
        value={assignToNewUsers}
        onChange={setAssignToNewUsers}
      />
      <InputRadioGroup
        name="type"
        title={t('models.role.type')}
        value={type}
        onChange={setType}
        options={[
          {
            name: 'Admin Role',
            value: 'admin',
          },
          {
            name: 'App Role',
            value: 'app',
          },
        ]}
      />

      <div>
        <label className="flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
          <div className="flex items-center justify-between space-x-1">
            <div className="text-lg font-bold text-gray-900">{t('models.role.permissions')}</div>
          </div>
          <div>
            {filteredItems().filter((f) => f.type === type).length === rolePermissions.length ? (
              <ButtonTertiary disabled={!canUpdate} onClick={() => setRolePermissions([])}>
                Clear
              </ButtonTertiary>
            ) : (
              <ButtonTertiary
                disabled={!canUpdate}
                onClick={() => setRolePermissions(filteredItems().map((f) => f.name))}
              >
                Select all
              </ButtonTertiary>
            )}
          </div>
        </label>
        <InputSearch value={searchInput} onChange={setSearchInput} />
        <div className="mt-1">
          {rolePermissions.map((permission) => {
            return <input key={permission} type="hidden" name="permissions[]" value={permission} />
          })}
          {filteredItems().map((permission, idx) => {
            return (
              <div key={idx}>
                {/* <InputCheckboxWithDescription
                  disabled={!canUpdate}
                  name={permission.order + " " + permission.name}
                  title={permission.description}
                  description={permission.name}
                  defaultValue={hasPermission(permission)}
                  onChange={(e) => setPermission(permission, e)}
                  key={idx}
                /> */}
                <div className="items-top flex space-x-2 py-2">
                  <Checkbox
                    id={permission.name}
                    name={permission.name}
                    checked={hasPermission(permission)}
                    onCheckedChange={(e: any) => setPermission(permission, e)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={permission.name}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.name}
                    </label>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border px-4 py-2 sm:px-6"></div>

      <div className="flex justify-between space-x-2">
        <div>
          {item && canDelete && (
            <ButtonSecondary type="button" onClick={onDelete}>
              {t('shared.delete')}
            </ButtonSecondary>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <ButtonSecondary type="button" onClick={onCancel}>
            {t('shared.cancel')}
          </ButtonSecondary>
          <LoadingButton isLoading={serverAction.pending} type="submit">
            {t('shared.save')}
          </LoadingButton>
        </div>
      </div>
    </form>
  )
}
