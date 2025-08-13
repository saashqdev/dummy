import { autosubscribeToTrialOrFreePlan } from '@/modules/subscriptions/services/PricingService'
import UrlUtils from '@/lib/utils/UrlUtils'
import { db } from '@/db'
import { createTenantSubscription } from '@/modules/subscriptions/services/TenantSubscriptionService'
import { stripeService } from '@/modules/subscriptions/services/StripeService'
import { createUserRole } from '@/modules/permissions/services/UserRolesService'
import { RoleModel, TenantDto, TenantModel, TenantWithDetailsDto } from '@/db/models'
import { cachified, clearCacheKey } from '@/lib/services/cache.server'
import { deleteUser, getUser, updateUser } from './UserService'

export async function getTenant(id: string): Promise<TenantWithDetailsDto | null> {
  return await cachified({
    key: `tenant:${id}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.tenant.get(id),
  })
}

export async function createTenant({
  name,
  slug,
  userId,
  icon,
  stripe_customer_id,
}: {
  name: string
  slug?: string
  userId: string
  icon?: string | null
  stripe_customer_id?: string | undefined
}) {
  const user = await getUser(userId)
  if (!user) {
    throw Error('User not found')
  }
  slug = await getNextAvailableTenantSlug({ name, slug })
  const tenantId = await db.tenant.create({
    name,
    slug,
    icon: icon || null,
    active: true,
  })
  const tenant = await getTenant(tenantId)
  if (!tenant) {
    throw Error('Tenant not found')
  }

  await updateUser(user?.id, { default_tenant_id: tenant.id })

  if (process.env.STRIPE_SK && !stripe_customer_id) {
    const stripeCustomer = await stripeService.createStripeCustomer(user.email, name)
    if (!stripeCustomer) {
      throw new Error('Could not create Stripe customer')
    }
    stripe_customer_id = stripeCustomer.id
  }
  if (stripe_customer_id) {
    await createTenantSubscription(tenant.id, stripe_customer_id)
    await autosubscribeToTrialOrFreePlan({ tenantId: tenant.id })
  }

  return tenant
}

async function getNextAvailableTenantSlug({ name, slug }: { name: string; slug?: string }) {
  if (slug === undefined) {
    slug = UrlUtils.slugify(name)
  }
  let tries = 1
  do {
    const existingSlug = await tenantSlugAlreadyExists(slug)
    if (existingSlug) {
      slug = UrlUtils.slugify(name) + tries.toString()
      tries++
    } else {
      break
    }
  } while (true)
  return slug
}

export async function tenantSlugAlreadyExists(slug: string) {
  if (['new-account', 'undefined', 'null'].includes(slug)) {
    return true
  }
  const existing = await db.tenant.countBySlug(slug)
  return existing > 0
}

export async function getTenantIdFromUrl(tenant: string) {
  const tenantId = await cachified({
    key: `tenantIdOrSlug:${tenant}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.tenant.getIdByIdOrSlug(tenant),
  })
  if (!tenantId) {
    throw Error('Account not found with slug: ' + tenant)
  }
  return tenantId
}

export async function getTenantSimple(id: string): Promise<TenantDto | null> {
  return await cachified({
    key: `tenantSimple:${id}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.tenant.getSimple(id),
  })
}

export async function getTenantByIdOrSlug(id: string): Promise<TenantDto | null> {
  return await cachified({
    key: `tenantIdOrSlug:${id}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.tenant.getByIdOrSlug(id),
  })
}

export async function updateTenant(
  before: { id: string; slug: string },
  data: { name?: string; icon?: string; slug?: string },
): Promise<void> {
  await db.tenant
    .update(before.id, { name: data.name, icon: data.icon, slug: data.slug })
    .then((item) => {
      clearCacheKey(`tenant:${before.slug}`)
      clearCacheKey(`tenant:${before.id}`)
      clearCacheKey(`tenantIdOrSlug:${before.id}`)
      clearCacheKey(`tenantIdOrSlug:${before.slug}`)
      clearCacheKey(`tenantSimple:${before.id}`)
      if (data.slug) {
        clearCacheKey(`tenant:${data.slug}`)
        clearCacheKey(`tenantIdOrSlug:${data.slug}`)
      }
      return item
    })
}

export async function deleteUserWithItsTenants(id: string) {
  const userTenants = await db.tenant.getByUser(id)
  const deletedAccounts: TenantModel[] = []
  await Promise.all(
    userTenants.map(async ({ id }) => {
      const tenant = await getTenant(id)
      if (tenant?.users.length === 1 && tenant.users[0].userId === id) {
        // If the user is the only user in the tenant, delete the tenant
        await deleteAndCancelTenant(id)
        deletedAccounts.push(tenant)
      }
    }),
  )
  const deletedTenants: TenantModel[] = []
  deletedAccounts.forEach((deletedAccount) => {
    if (deletedAccount) {
      deletedTenants.push(deletedAccount)
    }
  })
  return {
    deletedUser: await deleteUser(id),
    deletedTenants,
  }
}

export async function deleteAndCancelTenant(id: string) {
  const tenantSubscription = await db.tenantSubscription.get(id)
  if (tenantSubscription?.products) {
    await Promise.all(
      tenantSubscription.products.map(async (product) => {
        if (product?.stripe_subscription_id) {
          await stripeService.cancelStripeSubscription(product?.stripe_subscription_id)
        }
      }),
    )
  }
  if (tenantSubscription?.stripe_customer_id) {
    await stripeService.deleteStripeCustomer(tenantSubscription?.stripe_customer_id)
  }
  return await deleteTenant(id)
}

export async function deleteTenant(id: string): Promise<void> {
  await db.tenant.del(id).then(() => {
    clearCacheKey(`tenant:${id}`)
    clearCacheKey(`tenantIdOrSlug:${id}`)
    clearCacheKey(`tenantSimple:${id}`)
  })
}

export async function addTenantUser({
  tenantId,
  userId,
  roles,
}: {
  tenantId: string
  userId: string
  roles?: RoleModel[]
}) {
  const tenantUserId = await db.tenantUser.create({
    tenant_id: tenantId,
    userId,
  })
  const tenantUser = await db.tenantUser.getById(tenantUserId)
  if (!tenantUser) {
    throw Error('Could not create tenant user')
  }

  if (!roles) {
    roles = await db.role.getAll('app')
  }
  await Promise.all(
    roles.map(async (role) => {
      return await createUserRole({
        userId: tenantUser.userId,
        roleId: role.id,
        tenantId: tenantUser.tenant_id,
      })
    }),
  )

  return tenantUser
}
