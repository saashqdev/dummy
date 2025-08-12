'use server'

import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import {
  deleteAndCancelTenant,
  getTenant,
  getTenantByIdOrSlug,
  getTenantIdFromUrl,
  updateTenant,
} from '@/modules/accounts/services/TenantService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { storeSupabaseFile } from '@/modules/storage/SupabaseStorageService'
import { redirect } from 'next/navigation'
import Component from './component'
import { requireTenantSlug } from '@/lib/services/url.server'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { getActiveTenantSubscriptions } from '@/modules/subscriptions/services/SubscriptionService'
import { revalidatePath } from 'next/cache'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.tenant.object')} | ${defaultSiteTags.title}`,
  })
}

export const actionAppSettingsAccount = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations()
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  await verifyUserHasPermission('app.settings.account.update', tenantId)

  const action = form.get('action')?.toString() ?? ''

  if (action === 'edit') {
    const name = form.get('name')?.toString() ?? ''
    const slug = form.get('slug')?.toString().toLowerCase() ?? ''
    const icon = form.get('icon')?.toString() ?? ''
    if ((name?.length ?? 0) < 1) {
      return { error: 'Account name must have at least 1 character' }
    }
    if (!slug || slug.length < 1) {
      return { error: 'Account slug must have at least 1 character' }
    }

    if (['settings'].includes(slug.toLowerCase())) {
      return { error: 'Slug cannot be ' + slug }
    }
    if (slug.includes(' ')) {
      return { error: 'Slug cannot contain white spaces' }
    }

    const existing = await getTenant(tenantId)
    if (!existing) {
      return { error: 'Tenant not found' }
    }

    if (existing?.slug !== slug) {
      const existingSlug = await getTenantByIdOrSlug(slug)
      if (existingSlug) {
        return { error: 'Slug already taken' }
      }
      let iconStored = icon
        ? await storeSupabaseFile({ bucket: 'accounts-icons', content: icon, id: tenantId })
        : icon
      await updateTenant(existing, { name, icon: iconStored, slug })
      return redirect(`/app/${encodeURIComponent(slug)}/settings/account`)
    } else {
      let iconStored = icon
        ? await storeSupabaseFile({ bucket: 'accounts-icons', content: icon, id: tenantId })
        : icon
      await updateTenant(existing, { name, icon: iconStored, slug })
      revalidatePath(`/app/${tenantSlug}/settings/account`)
      return { success: t('settings.tenant.updated') }
    }
  } else if (action === 'delete') {
    await verifyUserHasPermission('app.settings.account.delete', tenantId)
    const activeSubscriptions = await getActiveTenantSubscriptions(tenantId)
    if (activeSubscriptions && activeSubscriptions.products.find((f) => !f.cancelled_at)) {
      return { error: 'You cannot delete a tenant with active subscriptions' }
    }
    await deleteAndCancelTenant(tenantId)
    return redirect('/app')
  } else {
    return { error: t('shared.invalidForm') }
  }
}

export default async function ({}: IServerComponentsProps) {
  return <Component />
}
