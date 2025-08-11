'use server'

import { db } from '@/db'
import {
  TenantSubscriptionWithDetailsDto,
  TenantWithDetailsDto,
  UserWithDetailsDto,
} from '@/db/models'
import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import {
  deleteAndCancelTenant,
  getTenant,
  getTenantByIdOrSlug,
  updateTenant,
} from '@/modules/accounts/services/TenantService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import Component from './component'
import { revalidatePath } from 'next/cache'
import { SubscriptionProductDto } from '@/modules/subscriptions/dtos/SubscriptionProductDto'
import { redirect } from 'next/navigation'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.tenant.object')} | ${defaultSiteTags.title}`,
  })
}

export type AdminAccountEditLoaderData = {
  tenant: TenantWithDetailsDto
  users: UserWithDetailsDto[]
  subscription: TenantSubscriptionWithDetailsDto | null
  subscriptionProducts: SubscriptionProductDto[]
  isStripeTest: boolean
}

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params
  const id = params?.id?.toString()
  console.log({ params })
  console.log('id', id)
  if (!id) {
    return redirect('/admin/accounts')
  }
  await verifyUserHasPermission('admin.account.view')
  const { t } = await getServerTranslations()

  const tenant = await getTenant(id)
  if (!tenant) {
    return redirect('/admin/accounts')
  }
  const users = await db.user.getAllWhereTenant(tenant.id)
  const subscription = await db.tenantSubscription.get(id ?? '')
  const subscriptionProducts = await db.subscription_product.getAllSubscriptionProducts()

  const data: AdminAccountEditLoaderData = {
    tenant,
    users,
    subscription,
    subscriptionProducts,
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith('sk_test_') ?? true,
  }
  return data
}

export const actionAdminAccountEdit = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.account.settings.update')
  const { t } = await getServerTranslations()

  const action = form.get('action')?.toString() ?? ''
  const id = form.get('id')?.toString() ?? ''
  if (!id) {
    return { error: 'Invalid tenant ID' }
  }

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

    const existing = await getTenant(id)
    if (!existing) {
      return { error: 'Invalid tenant' }
    }

    if (existing.slug !== slug) {
      const existingSlug = await getTenantByIdOrSlug(slug)
      if (existingSlug) {
        return { error: 'Slug already taken' }
      }
    }
    await updateTenant(existing, { name, icon, slug })
    revalidatePath('/admin/accounts/' + id)
    return {
      success: t('settings.tenant.updated'),
    }
  } else if (action === 'delete-tenant') {
    await deleteAndCancelTenant(id ?? '')
    return redirect('/admin/accounts')
  } else {
    return { error: t('shared.invalidForm') }
  }
}

export default async function (props: IServerComponentsProps) {
  const data = await loader(props)
  return <Component data={data} />
}
