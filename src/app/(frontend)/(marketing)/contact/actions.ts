'use server'

import { getServerTranslations } from '@/i18n/server'
import { getBaseURL } from '@/lib/services/url.server'
import { defaultAppConfiguration } from '@/modules/core/data/defaultAppConfiguration'
import { getEmailConfig, sendEmail } from '@/modules/emails/services/EmailService'

export async function actionContact(prev: any, form: FormData) {
  const { t } = await getServerTranslations()
  const submission = {
    first_name: form.get('first_name')?.toString() ?? '',
    last_name: form.get('last_name')?.toString() ?? '',
    email: form.get('email')?.toString() ?? '',
    company: form.get('company')?.toString() ?? '',
    jobTitle: form.get('jobTitle')?.toString() ?? '',
    message: form.get('comments')?.toString() ?? '',
    honeypot: form.get('codeId')?.toString() ?? '',
  }
  if (submission.honeypot) {
    console.log('[Contact] SPAM detected: honeypot field filled', { submission })
    return {
      error: 'An error occurred while submitting the form. Please try again later.',
    }
  }
  console.log('[Contact] New submission', { submission })

  const emailConfig = getEmailConfig()
  if (emailConfig) {
    try {
      await sendEmail({
        to: defaultAppConfiguration.email.support_email,
        subject: 'New contact form submission',
        body: `
                <p>
                  <b>Name</b>: ${submission.first_name} ${submission.last_name}<br/>
                  <b>Email</b>: ${submission.email}<br/>
                  ${submission.company && `<b>Company</b>: ${submission.company}<br/>`}
                  ${submission.jobTitle && `<b>Job Title</b>: ${submission.jobTitle}<br/>`}
                  <b>From site</b>: ${await getBaseURL()}<br/>
                  </p>
                  <p>
                  <b>Message</b>: ${submission.message}<br/>
                </p>
                `,
      })
    } catch (e: any) {
      console.error('[Contact] Error sending email', e)
      return {
        error: 'An error occurred while submitting the form: ' + e.message,
      }
    }
  }

  return {
    success: t('front.contact.success', { 0: submission.first_name }),
  }
}
