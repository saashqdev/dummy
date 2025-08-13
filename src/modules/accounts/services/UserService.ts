import { getTenant } from '@/modules/accounts/services/TenantService'
import { cachified, clearCacheKey } from '@/lib/services/cache.server'
import bcrypt from 'bcryptjs'
import { db } from '@/db'

export async function getUser(user_id: string | undefined) {
  if (!user_id) {
    return null
  }
  return await cachified({
    key: `user:${user_id}`,
    ttl: 1000 * 60 * 60 * 24, // 1 day
    getFreshValue: async () => db.user.get(user_id),
  })
}

export async function getDefaultTenant(user: {
  id: string
  default_tenant_id: string | null
  admin?: boolean
}) {
  if (user.admin) {
    return null
  }
  if (user.default_tenant_id) {
    const tenant = await getTenant(user.default_tenant_id)
    return tenant
  }
  const userTenants = await db.tenant.getByUser(user.id)
  if (userTenants.length > 0) {
    return userTenants[0]
  }
  return null
}

export async function createUser(data: {
  email: string
  firstName?: string
  lastName?: string
  password?: string
  active?: boolean
  avatar?: string | null
  locale?: string | null
  default_tenant_id?: string | null
}) {
  const { email, password, firstName, lastName, active, avatar, locale, default_tenant_id } = data
  const passwordHash = password ? await bcrypt.hash(password, 10) : ''
  const id = await db.user.create({
    email,
    passwordHash: passwordHash,
    firstName: firstName || '',
    lastName: lastName || '',
    avatar: avatar || null,
    locale: locale || null,
    defaultTenantId: default_tenant_id || null,
    active: active !== undefined ? active : true,
    phone: null,
    admin: false,
    verifyToken: null,
  })
  const user = await getUser(id)
  if (!user) {
    throw new Error('Could not create user')
  }
  return user
}

export async function updateUser(
  id: string,
  data: {
    passwordHash?: string
    firstName?: string
    lastName?: string
    avatar?: string
    phone?: string
    default_tenant_id?: string
    verify_token?: string
    locale?: string
    admin?: boolean
  },
) {
  if (!id) {
    return null
  }
  return await db.user
    .update(id, {
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
      locale: data.locale,
      verify_token: data.verify_token,
      hash: data.passwordHash,
      default_tenant_id: data.default_tenant_id,
      admin: data.admin,
    })
    .then((item) => {
      clearCacheKey(`user:${id}`)
      return item
    })
}

export async function deleteUser(id: string): Promise<void> {
  await db.user.del(id).then((item) => {
    clearCacheKey(`user:${id}`)
    return item
  })
}
