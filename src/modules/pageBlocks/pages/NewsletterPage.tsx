import { TFunction } from 'i18next'
import { MetaTagsDto } from '@/lib/dtos/MetaTagsDto'
import { PageBlockDto } from '../blocks/PageBlockDto'
import { defaultSiteTags, getMetaTags } from '../seo/SeoMetaTagsUtils'
import { defaultHeader } from '../defaultBlocks/defaultHeader'
import { defaultFooter } from '../defaultBlocks/defaultFooter'
import { getEmailConfig, sendEmail } from '@/modules/emails/services/EmailService'
import NewsletterComponent from '../blocks/marketing/newsletter/NewsletterComponent'
import { defaultAppConfiguration } from '@/modules/core/data/defaultAppConfiguration'

export namespace NewsletterPage {
  export async function metatags({ t }: { t: TFunction }): Promise<MetaTagsDto> {
    return getMetaTags({
      title: `${t('front.newsletter.title')} | ${defaultSiteTags.title}`,
      description: `${t('front.newsletter.headline')}`,
    })
  }
  export function blocks({ t }: { t: TFunction }): PageBlockDto[] {
    return [
      // Header
      { header: defaultHeader({ t }) },
      // Main
      { render: <NewsletterComponent /> },
      // Footer
      { footer: defaultFooter({ t }) },
    ]
  }
  export async function actionSubscribe(
    prev: any,
    formData: FormData,
  ): Promise<{ error?: string; success?: string }> {
    const submission = {
      firstName: formData.get('firstName')?.toString() ?? '',
      lastName: formData.get('lastName')?.toString() ?? '',
      email: formData.get('email')?.toString() ?? '',
      source: formData.get('source')?.toString() ?? '',
      honeypot: formData.get('codeId')?.toString() ?? '',
    }

    if (submission.honeypot) {
      // eslint-disable-next-line no-console
      console.log('[Newsletter] SPAM detected: honeypot field filled', { submission })
      return { success: 'Thank you for subscribing!' }
    }

    if (!submission.email) {
      throw Error('Missing fields')
    }

    const emailConfig = getEmailConfig()
    if (emailConfig) {
      await sendEmail({
        to: defaultAppConfiguration.email.support_email,
        subject: 'New newsletter subscription',
        body: `
                <p>First Name: ${submission.firstName}</p>
                <p>Last Name: ${submission.lastName}</p>
                <p>Email: ${submission.email}</p>
                `,
      }).catch(() => {})
    }

    if (process.env.CONVERTKIT_APIKEY && process.env.CONVERTKIT_FORM) {
      const API_KEY = process.env.CONVERTKIT_APIKEY
      const FORM_ID = process.env.CONVERTKIT_FORM
      const API = 'https://api.convertkit.com/v3'

      const res = await fetch(`${API}/forms/${FORM_ID}/subscribe`, {
        method: 'post',
        body: JSON.stringify({
          email: submission.email,
          firstName: submission.lastName,
          lastName: submission.lastName,
          api_key: API_KEY,
        }),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      })

      try {
        const response = await res.json()
        if (response.error) {
          return { error: response.message }
        }
      } catch (e: any) {
        return { error: e.message }
      }
    }

    return {
      success: 'Thank you for subscribing!',
    }
  }
}
