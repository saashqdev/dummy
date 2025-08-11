'use server'

import { getServerTranslations } from '@/i18n/server'
import { updateAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { revalidatePath } from 'next/cache'

export const actionAnalyticsSettings = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations()
  const action = form.get('action')
  if (action === 'update') {
    await verifyUserHasPermission('admin.settings.analytics.update')
    await updateAppConfiguration({
      analytics_simple_analytics: Boolean(form.get('simpleAnalytics')),
      analytics_plausible_analytics: Boolean(form.get('plausibleAnalytics')),
      analytics_google_analytics_tracking_id: form.get('googleAnalyticsTrackingId')?.toString(),
    })
    revalidatePath('/admin/settings/analytics')
    return { success: t('shared.updated') }
  } else {
    return { error: t('shared.invalidForm') }
  }
}
