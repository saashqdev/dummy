'use client'

import ButtonPrimary from '@/components/ui/buttons/ButtonPrimary'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import InputCheckboxWithDescription from '@/components/ui/input/InputCheckboxWithDescription'
import InputFilters from '@/components/ui/input/InputFilters'
import IndexPageLayout from '@/components/ui/layouts/IndexPageLayout'
import SlideOverWideEmpty from '@/components/ui/slideOvers/SlideOverWideEmpty'
import { getUserHasPermission } from '@/lib/helpers/PermissionsHelper'
import useAdminData from '@/lib/state/useAdminData'
import UrlUtils from '@/lib/utils/UrlUtils'
import TenantsTable from '@/modules/accounts/components/tenants/TenantsTable'
import { useState, useEffect, useRef, useActionState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { actionAdminAccounts, AdminAccountsLoaderData } from './page'
import { Input } from '@/components/ui/input'

export default function ({ data }: { data: AdminAccountsLoaderData }) {
  const { t } = useTranslation()
  const [actionData, action, pending] = useActionState(actionAdminAccounts, null)
  const adminData = useAdminData()

  const [creatingNewAccount, setCreatingNewAccount] = useState(false)

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
    if (actionData?.created_tenant_id) {
      setCreatingNewAccount(false)
    }
  }, [actionData])

  return (
    <IndexPageLayout
      title={t('models.tenant.plural')}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} withSearch={false} />
          <ButtonPrimary
            disabled={!getUserHasPermission(adminData, 'admin.accounts.create')}
            onClick={() => setCreatingNewAccount(true)}
          >
            {t('shared.new')}
          </ButtonPrimary>
        </>
      }
    >
      <TenantsTable
        items={data.items}
        pagination={data.pagination}
        tenantInvoices={data.tenantInvoices}
        isStripeTest={data.isStripeTest}
      />

      <SlideOverWideEmpty
        title={t('app.tenants.create.title')}
        open={creatingNewAccount}
        onClose={() => {
          setCreatingNewAccount(false)
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">
            <CreateTenantForm action={action} />
          </div>
        </div>
      </SlideOverWideEmpty>
    </IndexPageLayout>
  )
}

function CreateTenantForm({ action }: { action: (payload: FormData) => void }) {
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    setSlug(UrlUtils.slugify(name))
  }, [name])

  const firstInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    setTimeout(() => {
      firstInput.current?.focus()
    }, 100)
  }, [])

  return (
    <form action={action} className="py-1">
      <input type="hidden" name="action" value="create" readOnly hidden />
      <div className="space-y-3">
        <div>
          <label className="mb-1 text-xs font-medium">
            {t('models.tenant.object')} <span className="text-red-500">*</span>
          </label>
          <Input
            ref={firstInput}
            autoFocus
            name="name"
            title={t('shared.name')}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 text-xs font-medium">
            {t('shared.slug')} <span className="text-red-500">*</span>
          </label>
          <Input
            name="slug"
            title={t('shared.slug')}
            value={slug}
            onBlur={() => setSlug(UrlUtils.slugify(slug))}
            onChange={(e) => setSlug(e.currentTarget.value)}
            required
          />
        </div>
        <InputCheckboxWithDescription
          name="addMyself"
          title="Add myself as owner"
          description="You will be added as owner of the new account."
          defaultValue={true}
        />

        <div className="flex justify-end">
          <LoadingButton type="submit">{t('shared.create')}</LoadingButton>
        </div>
      </div>
    </form>
  )
}
