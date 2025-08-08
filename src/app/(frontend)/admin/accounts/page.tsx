'use server'

import { db } from '@/db'
import { TenantWithDetailsDto } from '@/db/models'
import { getServerTranslations } from '@/i18n/server'
import { FilterablePropertyDto } from '@/lib/dtos/FilterablePropertyDto'
import { PaginationDto } from '@/lib/dtos/PaginationDto'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { getCurrentPagination, getStringFilter } from '@/lib/helpers/PaginationHelper'
import { getUserInfo } from '@/lib/services/session.server'
import {
  addTenantUser,
  createTenant,
  tenantSlugAlreadyExists,
} from '@/modules/accounts/services/TenantService'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { verifyUserHasPermission } from '@/modules/permissions/services/UserPermissionsService'
import { stripeService } from '@/modules/subscriptions/services/StripeService'
import Stripe from 'stripe'
import Component from './component'
import { revalidatePath } from 'next/cache'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('models.tenant.plural')} | ${defaultSiteTags.title}`,
  })
}

export type AdminAccountsLoaderData = {
  items: TenantWithDetailsDto[]
  filterableProperties: FilterablePropertyDto[]
  pagination: PaginationDto
  tenantInvoices: Stripe.Invoice[]
  isStripeTest: boolean
}

const loader = async (props: IServerComponentsProps) => {
  const searchParams = await props.searchParams
  await verifyUserHasPermission('admin.accounts.view')
  let { t } = await getServerTranslations()

  const filterableProperties = [
    { name: 'name', title: t('models.tenant.name') },
    { name: 'slug', title: t('models.tenant.slug') },
  ]
  const filters = {
    name: getStringFilter(searchParams, 'name'),
    slug: getStringFilter(searchParams, 'slug'),
  }
  const currentPagination = getCurrentPagination(searchParams)
  const { items, pagination } = await db.tenant.getAllWithPagination({
    filters,
    pagination: currentPagination,
  })

  const tenantInvoices: Stripe.Invoice[] = []
  await Promise.all(
    items.map(async (item) => {
      if (item.subscription?.stripe_customer_id) {
        const invoices = await stripeService.getStripeInvoices(
          item.subscription?.stripe_customer_id,
        )
        tenantInvoices.push(...invoices)
      }
    }),
  )

  const data: AdminAccountsLoaderData = {
    items: items.sort((a, b) => (a.created_at > b.created_at ? -1 : 1)),
    filterableProperties,
    pagination,
    tenantInvoices,
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith('sk_test_') ?? true,
  }
  return data
}

export const actionAdminAccounts = async (prev: any, form: FormData) => {
  await verifyUserHasPermission('admin.accounts.view')
  const { t } = await getServerTranslations()
  const userInfo = await getUserInfo()

  const action = form.get('action')?.toString()
  if (action === 'create') {
    await verifyUserHasPermission('admin.accounts.create')
    const name = form.get('name')?.toString() ?? ''
    const slug = form.get('slug')?.toString() ?? ''
    const existingSlug = await tenantSlugAlreadyExists(slug)
    if (!slug || existingSlug) {
      return { error: t('shared.slugTaken') }
    }
    const tenant = await createTenant({ name, slug, userId: userInfo.userId! })
    const addMyself = Boolean(form.get('addMyself'))
    if (addMyself) {
      await addTenantUser({
        tenantId: tenant.id,
        userId: userInfo.userId!,
      })
    }
    revalidatePath('/admin/accounts')
    return {
      created_tenant_id: tenant.id,
    }
  } else {
    return { error: t('shared.invalidForm') }
  }
}

export default async function (props: IServerComponentsProps) {
  const data = await loader(props)
  return <Component data={data} />
}
