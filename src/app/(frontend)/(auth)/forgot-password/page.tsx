'use server'

import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import Component from './component'
import { db } from '@/db'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { sendEmail } from '@/modules/emails/services/EmailService'
import EmailTemplates from '@/modules/emails/utils/EmailTemplates'
import { getBaseURL } from '@/lib/services/url.server'
import crypto from 'crypto'
import { updateUser } from '@/modules/accounts/services/UserService'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('account.forgot.title')} | ${defaultSiteTags.title}`,
  })
}

export const actionForgotPassword = async (prev: any, form: FormData) => {
  const appConfiguration = await getAppConfiguration()
  const email = form.get('email')?.toString()

  if (!email) {
    return { error: 'Email required' }
  }

  const user = await db.user.getByEmail(email)
  if (!user) {
    // Do not show that the email was not found, fake wait
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return { success: 'Email sent' }
  }

  var verify_token = crypto.randomBytes(20).toString('hex')
  await updateUser(user.id, { verify_token })
  await sendEmail({
    to: email,
    ...EmailTemplates.PASSWORD_RESET_EMAIL.parse({
      appConfiguration,
      name: user.first_name,
      action_url: new URL(
        (await getBaseURL()) + `/reset?e=${encodeURIComponent(email)}&t=${verify_token}`,
      ).toString(),
    }),
  })

  return {
    success: 'Email sent',
  }
}

export default async function () {
  return <Component />
}
