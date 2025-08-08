'use server'

import { getServerTranslations } from '@/i18n/server'
import { updateAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { revalidatePath } from 'next/cache'

export const actionAuthenticationSettings = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations()
  const action = form.get('action')
  if (action === 'update') {
    await verifyUserHasPermission('admin.settings.authentication.update')
    await updateAppConfiguration({
      auth_require_email_verification: Boolean(form.get('requireEmailVerification')),
      auth_require_organization: Boolean(form.get('requireOrganization')),
      auth_require_name: Boolean(form.get('requireName')),
      subscription_required: Boolean(form.get('required')),
      subscription_allow_subscribe_before_sign_up: Boolean(form.get('allowSubscribeBeforeSignUp')),
      subscription_allow_sign_up_before_subscribe: Boolean(form.get('allowSignUpBeforeSubscribe')),
    })
    revalidatePath('/admin/settings/authentication')
    return { success: t('shared.updated') }
  } else {
    return { error: t('shared.invalidForm') }
  }
}
