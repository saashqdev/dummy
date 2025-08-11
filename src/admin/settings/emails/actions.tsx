'use server'

import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { getUserInfo } from '@/lib/services/session.server'
import { getServerTranslations } from '@/i18n/server'
import { getUser } from '@/modules/accounts/services/UserService'
import EmailTemplates from '@/modules/emails/utils/EmailTemplates'
import { sendEmail } from '@/modules/emails/services/EmailService'

export const actionAdminEmails = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.emails.view')
  const { t } = await getServerTranslations()
  const appConfiguration = await getAppConfiguration()
  const userInfo = await getUserInfo()
  const user = userInfo.userId ? await getUser(userInfo.userId) : null

  const action = form.get('action')?.toString()
  if (action === 'send-test') {
    const email = form.get('email')?.toString()
    const templateName = form.get('template')?.toString()
    if (!email) {
      return { error: 'Invalid email' }
    }
    const template = EmailTemplates.allTemplates.find((f) => f.name === templateName)
    if (!template) {
      return { error: 'Invalid template' }
    }
    try {
      await sendEmail({
        to: email,
        ...template.parse({
          appConfiguration,
          name: user?.first_name,
          invite_sender_name: user?.first_name,
          invite_sender_organization: '{Account Name}',
        }),
      })
      return { success: 'Test email sent' }
    } catch (e: any) {
      return { error: 'Error sending email: ' + e.message }
    }
  }
  return { error: t('shared.invalidForm') }
}
