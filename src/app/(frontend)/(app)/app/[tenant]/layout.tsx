import SidebarLayout from '@/components/layouts/SidebarLayout'
import AppDataLayout from '@/context/AppDataLayout'
import { db } from '@/db'
import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { getUserInfo } from '@/lib/services/session.server'
import { getCurrentUrl, requireTenantSlug } from '@/lib/services/url.server'
import { AppDataDto } from '@/lib/state/useAppData'
import { promiseHash } from '@/lib/utils'
import UrlUtils from '@/lib/utils/UrlUtils'
import { getTenantIdFromUrl, getTenantSimple } from '@/modules/accounts/services/TenantService'
import { getUser, updateUser } from '@/modules/accounts/services/UserService'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { CreditTypes } from '@/modules/credits/dtos/CreditType'
import { DefaultPermission } from '@/modules/permissions/data/DefaultPermission'
import { AdminRoleEnum } from '@/modules/permissions/enums/AdminRoleEnum'
import { AppRoleEnum } from '@/modules/permissions/enums/AppRoleEnum'
import { getPermissionsByUser } from '@/modules/permissions/services/UserRolesService'
import { DefaultAppFeatures } from '@/modules/subscriptions/data/appFeatures'
import { PlanFeatureUsageDto } from '@/modules/subscriptions/dtos/PlanFeatureUsageDto'
import {
  getActiveTenantSubscriptions,
  getPlanFeatureUsage,
} from '@/modules/subscriptions/services/SubscriptionService'
import { redirect } from 'next/navigation'

const loader = async () => {
  const tenantSlug = await requireTenantSlug()
  const tenantId = await getTenantIdFromUrl(tenantSlug)
  const userInfo = await getUserInfo()
  if (!userInfo.user_id) {
    throw redirect('/login')
  }
  if (!tenantSlug) {
    throw redirect('/app')
  }
  const { user, currentTenant } = await promiseHash({
    user: getUser(userInfo.user_id!),
    currentTenant: getTenantSimple(tenantId),
  })

  const url = new URL(await getCurrentUrl())
  const redirectTo = url.pathname + url.search
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([['redirect', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }

  if (!currentTenant) {
    throw redirect(`/app`)
  }

  if (!user?.admin) {
    const tenantUser = await db.tenantUser.get({ tenantId, userId: userInfo.user_id })
    if (!tenantUser) {
      throw redirect('/app')
    }
  }
  if (user?.default_tenant_id !== tenantId) {
    await updateUser(userInfo.user_id, { default_tenant_id: tenantId })
  }

  let { myTenants, mySubscription, allPermissions, superUserRole, superAdminRole } =
    await promiseHash({
      myTenants: db.tenant.getByUser(user.id),
      mySubscription: getActiveTenantSubscriptions(tenantId),
      allPermissions: getPermissionsByUser(userInfo.user_id, tenantId),
      superUserRole: db.userRole.getInTenant(userInfo.user_id, tenantId, AppRoleEnum.SuperUser),
      superAdminRole: db.userRole.getInAdmin(userInfo.user_id, AdminRoleEnum.SuperAdmin),
    })

  if (!UrlUtils.stripTrailingSlash(url.pathname).startsWith(`/app/${tenantSlug}/settings`)) {
    const appConfiguration = await getAppConfiguration()
    if (appConfiguration.subscription.required && mySubscription?.products.length === 0) {
      throw redirect(`/subscribe/${tenantSlug}?error=subscription_required`)
    }
  }

  let credits: PlanFeatureUsageDto | undefined = undefined
  if (CreditTypes.length > 0) {
    credits = await getPlanFeatureUsage(tenantId, DefaultAppFeatures.Credits)
  }
  const data: AppDataDto = {
    user,
    myTenants,
    currentTenant,
    mySubscription,
    permissions: allPermissions.map((f) => f as DefaultPermission),
    isSuperUser: !!superUserRole,
    isSuperAdmin: !!superAdminRole,
    credits,
  }

  return data
}

export default async function ({ children }: IServerComponentsProps) {
  const appData = await loader()
  return (
    <AppDataLayout data={appData}>
      <div className="min-h-screen bg-white">
        <SidebarLayout layout="app" appData={appData}>
          {children}
        </SidebarLayout>
      </div>
    </AppDataLayout>
  )
}
