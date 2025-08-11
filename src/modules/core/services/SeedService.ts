/* eslint-disable no-console */
import bcrypt, { hash } from 'bcryptjs'
import {
  defaultAdminRoles,
  defaultAppRoles,
  defaultPermissions,
  CreateRoleDto,
} from '@/modules/permissions/data/DefaultRoles'
import { AdminRoleEnum } from '@/modules/permissions/enums/AdminRoleEnum'
import { AppRoleEnum } from '@/modules/permissions/enums/AppRoleEnum'
import {
  createPermissions,
  createRolePermission,
} from '@/modules/permissions/services/PermissionsService'
import { createUserRole } from '@/modules/permissions/services/UserRolesService'
import { db } from '@/db'
import { createRole } from '@/modules/permissions/services/RolesService'
import { defaultAppConfiguration } from '../data/defaultAppConfiguration'

const ADMIN_EMAIL = 'admin@email.com'

async function seed() {
  console.log('🌱 Seeding admin user', 1)
  const admin = await createUser({
    firstName: 'Admin',
    lastName: 'User',
    email: ADMIN_EMAIL,
    password: 'password',
    admin: true,
  })

  console.log('🌱 Creating users with tenants', 2)
  const user1 = await createUser({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    password: 'password',
    admin: false,
  })
  const user2 = await createUser({
    firstName: 'Luna',
    lastName: 'Davis',
    email: 'luna.davis@company.com',
    password: 'password',
    admin: false,
  })

  console.log('🌱 Creating tenants', 2)
  await createTenant('acme-corp-1', 'Acme Corp 1', [
    { ...admin, role: AppRoleEnum.SuperUser },
    { ...user1, role: AppRoleEnum.Admin },
    { ...user2, role: AppRoleEnum.User },
  ])
  await createTenant('acme-corp-2', 'Acme Corp 2', [
    { ...user1, role: AppRoleEnum.SuperUser },
    { ...user2, role: AppRoleEnum.User },
  ])

  // Permissions
  await seedRolesAndPermissions(ADMIN_EMAIL)
}

async function createUser({
  firstName,
  lastName,
  email,
  password,
  admin,
}: {
  firstName: string
  lastName: string
  email: string
  password: string
  admin: boolean
}) {
  const passwordHash = await bcrypt.hash(password, 10)
  let user = await db.user.getByEmail(email)
  if (!user) {
    const user_id = await db.user.create({
      email,
      hash: passwordHash,
      firstName,
      lastName,
      avatar: null,
      phone: null,
      default_tenant_id: null,
      verify_token: null,
      locale: null,
      active: true,
      admin,
    })
    user = await db.user.get(user_id)
    if (!user) {
      throw Error('Did not create user with email: ' + email)
    }
  }
  if (!user.admin && admin) {
    await db.user.update(user.id, {
      admin: true,
    })
  }
  return user
}

async function createTenant(
  slug: string,
  name: string,
  users: { id: string; role: AppRoleEnum }[],
) {
  let tenant = await db.tenant.getByIdOrSlug(slug)
  if (tenant) {
    console.log(`ℹ️ Tenant already exists`, slug)
    return tenant
  }
  const tenantId = await db.tenant.create({
    name,
    slug,
    icon: '',
    active: true,
  })

  await db.tenantSubscription.create({
    tenant_id: tenantId,
    stripe_customer_id: '',
  })

  for (const user of users) {
    const tenantUser = await db.tenantUser.get({ tenant_id: tenantId, userId: user.id })
    if (tenantUser) {
      console.log(`ℹ️ User already in tenant`, user.id, tenantId)
      continue
    }
    await db.tenantUser.create({
      tenant_id: tenantId,
      userId: user.id,
    })
  }

  return tenant
}

async function seedRolesAndPermissions(adminEmail?: string): Promise<void> {
  const admin_roles = await seedRoles(defaultAdminRoles)
  // eslint-disable-next-line no-console
  console.log('🌱 Seeding admin roles and permissions', admin_roles.length)

  const appRoles = await seedRoles(defaultAppRoles)
  // eslint-disable-next-line no-console
  console.log('🌱 Seeding app roles and permissions', appRoles.length)

  await createPermissions(defaultPermissions)

  const users = await db.user.getAll()
  await Promise.all(
    users
      .filter((f) => f.admin)
      .map(async (user) => {
        // console.log({ adminUser: user });
        admin_roles.map(async (adminRoleId) => {
          if (adminEmail && user.email === adminEmail) {
            return await createUserRole({ userId: user.id, roleId: adminRoleId, tenantId: null })
          }
        })
      }),
  )

  const tenants = await db.tenant.getAll()
  await Promise.all(
    tenants.map(async (tenant) => {
      tenant.users.map(async (tenantUser) => {
        appRoles.map(async (appRoleId) => {
          // console.log({ user: tenantUser.user.email, role: appRole.name });
          return await createUserRole({
            userId: tenantUser.userId,
            roleId: appRoleId,
            tenantId: tenant.id,
          })
        })
      })
    }),
  )

  const guestRole = await db.role.getByName(AdminRoleEnum.Guest)
  if (guestRole) {
    const viewAndReadPermissions = (await db.permission.getAll()).filter(
      (f) => f.name.includes('.view') || f.name.includes('.read'),
    )
    await Promise.all(
      viewAndReadPermissions.map(async (permission) => {
        await createRolePermission({
          roleId: guestRole.id,
          permissionId: permission.id,
        })
      }),
    )
  }
}

async function seedRoles(roles: CreateRoleDto[]): Promise<string[]> {
  const allRoles = await db.role.getAll()
  return await Promise.all(
    roles.map(async (data, idx) => {
      const existing = allRoles.find((f) => f.name === data.name)
      if (existing) {
        return existing.id
      }
      const role = await createRole({
        ...data,
        order: idx + 1,
        isDefault: true,
      })
      await new Promise((r) => setTimeout(r, 10))
      return role
    }),
  )
}

export default {
  seed,
  seedRolesAndPermissions,
}
