'use client'

import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import ButtonTertiary from '@/components/ui/buttons/ButtonTertiary'
import InputRadioGroup from '@/components/ui/input/InputRadioGroup'
import InputSearch from '@/components/ui/input/InputSearch'
import { PermissionWithRolesDto, RoleWithPermissionsDto } from '@/db/models'
import { Input } from '@/components/ui/input'
import ButtonSecondary from '@/components/ui/buttons/ButtonSecondary'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import { IServerAction } from '@/lib/dtos/ServerComponentsProps'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  item?: PermissionWithRolesDto
  roles: RoleWithPermissionsDto[]
  onCancel: () => void
  canUpdate?: boolean
  canDelete?: boolean
  serverAction: IServerAction
}

export default function PermissionForm({
  item,
  roles,
  onCancel,
  canUpdate = true,
  canDelete,
  serverAction,
}: Props) {
  const { t } = useTranslation()

  const [permissionRoles, setRoles] = useState<string[]>([])
  const [type, setType] = useState<string | number | undefined>(item?.type ?? 'admin')

  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    setRoles([])
  }, [type])

  useEffect(() => {
    const permissionRoles: string[] = []
    if (item) {
      item?.in_roles.forEach((item) => {
        permissionRoles.push(item.role.name)
      })
    }
    setRoles(permissionRoles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function hasRole(role: RoleWithPermissionsDto) {
    return permissionRoles.includes(role.name)
  }

  function setPermission(role: RoleWithPermissionsDto, add: any) {
    if (add) {
      setRoles([...permissionRoles, role.name])
    } else {
      setRoles(permissionRoles.filter((f) => f !== role.name))
    }
  }

  const filteredItems = () => {
    if (!roles.filter((f) => f.type === type)) {
      return []
    }
    return roles
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
      <div className="text-lg font-bold text-gray-900">Permission Details</div>

      <div className="space-y-1">
        <label className="text-xs font-medium">
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
      <div className="space-y-1">
        <label className="text-xs font-medium">
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
      <InputRadioGroup
        disabled={!canUpdate}
        name="type"
        title={t('models.permission.type')}
        value={type}
        onChange={setType}
        options={[
          {
            name: 'Admin Permission',
            value: 'admin',
          },
          {
            name: 'App Permission',
            value: 'app',
          },
        ]}
      />

      <div>
        <label className="flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
          <div className="flex items-center justify-between space-x-1">
            <div className="text-lg font-bold text-gray-900">{t('models.role.plural')}</div>
          </div>
          <div>
            {filteredItems().length === permissionRoles.length ? (
              <ButtonTertiary disabled={!canUpdate} onClick={() => setRoles([])}>
                {t('shared.clear')}
              </ButtonTertiary>
            ) : (
              <ButtonTertiary
                disabled={!canUpdate}
                onClick={() => setRoles(filteredItems().map((f) => f.name))}
              >
                {t('shared.selectAll')}
              </ButtonTertiary>
            )}
          </div>
        </label>
        <InputSearch value={searchInput} onChange={setSearchInput} />
        <div className="mt-1">
          {permissionRoles.map((role) => {
            return <input key={role} type="hidden" name="roles[]" value={role} />
          })}
          {filteredItems().map((role, idx) => {
            return (
              <div key={idx}>
                {/* <InputCheckboxWithDescription
                  disabled={!canUpdate}
                  name={role.order + " " + role.name}
                  title={<RoleBadge item={role} />}
                  description={role.description}
                  defaultValue={hasRole(role)}
                  // value={hasRole(role)}
                  onChange={(e) => setPermission(role, e)}
                  key={idx}
                /> */}
                <div className="items-top flex space-x-2 py-2">
                  <Checkbox
                    id={role.name}
                    name={role.name}
                    checked={hasRole(role)}
                    onCheckedChange={(e: any) => setPermission(role, e)}
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
