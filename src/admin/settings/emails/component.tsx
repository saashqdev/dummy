'use client'

import { useActionState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useAdminData from '@/lib/state/useAdminData'
import toast from 'react-hot-toast'
import IndexPageLayout from '@/components/ui/layouts/IndexPageLayout'
import { actionAdminEmails } from './actions'
import TableSimple from '@/components/ui/tables/TableSimple'
import EmailTemplates from '@/modules/emails/utils/EmailTemplates'
import { defaultAppConfiguration } from '@/modules/core/data/defaultAppConfiguration'

export default function () {
  const adminData = useAdminData()
  const [actionData, action, pending] = useActionState(actionAdminEmails, null)
  const { t } = useTranslation()

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
    if (actionData?.success) {
      toast.success(actionData.success)
    }
  }, [actionData])

  function sendTest(templateName: string): void {
    let to = adminData.user?.email
    if (to === 'admin@email.com') {
      to = defaultAppConfiguration.email.support_email
    }
    const email = window.prompt('Email', to)
    if (!email || email.trim() === '') {
      return
    }
    const form = new FormData()
    form.set('action', 'send-test')
    form.set('template', templateName)
    form.set('email', email)
    action(form)
  }
  return (
    <IndexPageLayout
      title={t('settings.admin.transactionalEmails.title')}
      buttons={
        <>
          <div className="font-bold">
            {defaultAppConfiguration.email.provider || 'No provider configured'}
          </div>
        </>
      }
    >
      <TableSimple
        items={EmailTemplates.allTemplates}
        headers={[
          {
            name: 'name',
            title: t('admin.emails.name'),
            value: (i) => i.name,
          },
          {
            name: 'description',
            title: t('shared.description'),
            value: (i) => i.description,
          },
        ]}
        actions={[
          {
            title: t('admin.emails.sendTest'),
            onClick: (_, item) => sendTest(item.name),
            disabled: () => pending,
          },
        ]}
      />
    </IndexPageLayout>
  )
}
