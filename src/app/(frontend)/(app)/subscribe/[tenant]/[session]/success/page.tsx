'use server'

import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { getUserInfo } from '@/lib/services/session.server'
import { getTenant, getTenantIdFromUrl } from '@/modules/accounts/services/TenantService'
import { getUser } from '@/modules/accounts/services/UserService'
import { defaultSiteTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'
import { persistCheckoutSessionStatus } from '@/modules/subscriptions/services/SubscriptionService'
import { getCurrentUrl } from '@/lib/services/url.server'
import { redirect } from 'next/navigation'
import Component from './component'
import { requireAuth } from '@/lib/services/loaders.middleware'
import {
  addTenantProductsFromCheckoutSession,
  getAcquiredItemsFromCheckoutSession,
} from '@/modules/subscriptions/services/PricingService'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return {
    title: `${t('pricing.subscribe')} | ${defaultSiteTags.title}`,
  }
}

export type AppSubscribeTenantSuccessLoaderData = {
  checkoutSession: { customer: { email: string }; products: { title: string }[] } | null
  error?: string
}

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params
  const { t } = await getServerTranslations()
  const tenantId = await getTenantIdFromUrl(params?.tenant!)
  const userInfo = await getUserInfo()
  await requireAuth({ tenantSlug: params?.tenant })

  const user = await getUser(userInfo.userId!)
  if (!user) {
    throw redirect(`/login`)
  }
  const tenant = await getTenant(tenantId)
  if (!tenant) {
    throw redirect(`/app`)
  }

  await persistCheckoutSessionStatus({
    id: params?.session ?? '',
    fromUrl: await getCurrentUrl(),
    fromUserId: user.id,
    fromTenantId: tenant.id,
  })
  const checkoutSession = await getAcquiredItemsFromCheckoutSession(params?.session ?? '')

  const data: AppSubscribeTenantSuccessLoaderData = {
    checkoutSession,
  }

  if (checkoutSession) {
    try {
      await addTenantProductsFromCheckoutSession({
        tenantId: tenantId,
        user,
        checkoutSession,
        createdUserId: null,
        created_tenant_id: null,
        t,
      })
      await Promise.all(
        checkoutSession.products.map(async (product) => {
          // await createLog(request, tenantId, "Subscribed", t(product.title ?? ""));
        }),
      )
      return data
      // return redirect(`/subscribe/${params.tenant}/${params.product}/success`);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log(e)
      return { ...data, error: e.message }
    }
  }
  return data
}

export default async function (props: IServerComponentsProps) {
  const data = await loader(props)
  return <Component data={data} />
}
