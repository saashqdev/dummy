import { sql } from 'drizzle-orm'

import {
  pgTable,
  uniqueIndex,
  foreignKey,
  text,
  boolean,
  timestamp,
  integer,
  index,
  doublePrecision,
} from 'drizzle-orm/pg-core'

export const user = pgTable(
  'User',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    email: text().notNull(),
    passwordHash: text().notNull(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    avatar: text(),
    phone: text(),
    defaultTenantId: text(),
    verifyToken: text(),
    locale: text(),
    active: boolean().default(false).notNull(),
    admin: boolean().default(false).notNull(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('User_email_key').using('btree', table.email.asc().nullsLast().op('text_ops')),
  ],
)

export const tenantUserInvitation = pgTable(
  'TenantUserInvitation',
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    email: text().notNull(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    pending: boolean().notNull(),
    createdUserId: text(),
    fromUserId: text(),
  },
  (table) => [
    uniqueIndex('TenantUserInvitation_createdUserId_key').using(
      'btree',
      table.createdUserId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.fromUserId],
      foreignColumns: [user.id],
      name: 'TenantUserInvitation_fromUserId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.createdUserId],
      foreignColumns: [user.id],
      name: 'TenantUserInvitation_createdUserId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: 'TenantUserInvitation_tenantId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const userRegistrationAttempt = pgTable(
  'UserRegistrationAttempt',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    email: text().notNull(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    slug: text(),
    token: text().notNull(),
    ipAddress: text(),
    company: text(),
    createdTenantId: text(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('UserRegistrationAttempt_createdTenantId_key').using(
      'btree',
      table.createdTenantId.asc().nullsLast().op('text_ops'),
    ),
    uniqueIndex('UserRegistrationAttempt_email_key').using(
      'btree',
      table.email.asc().nullsLast().op('text_ops'),
    ),
    uniqueIndex('UserRegistrationAttempt_token_key').using(
      'btree',
      table.token.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.createdTenantId],
      foreignColumns: [tenant.id],
      name: 'UserRegistrationAttempt_createdTenantId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const permission = pgTable(
  'Permission',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    name: text().notNull(),
    description: text().notNull(),
    type: text().notNull(),
    isDefault: boolean().notNull(),
    order: integer().notNull(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('Permission_name_key').using('btree', table.name.asc().nullsLast().op('text_ops')),
  ],
)

export const rolePermission = pgTable(
  'RolePermission',
  {
    id: text().primaryKey().notNull(),
    roleId: text().notNull(),
    permissionId: text().notNull(),
  } as Record<string, any>,
  (table) => [
    foreignKey({
      columns: [table.permissionId],
      foreignColumns: [permission.id],
      name: 'RolePermission_permissionId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [role.id],
      name: 'RolePermission_roleId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const appConfiguration = pgTable('AppConfiguration', {
  id: text().primaryKey().notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'string',
    withTimezone: true,
    precision: 3,
  }).notNull(),
  name: text().notNull(),
  theme: text(),
  authRequireEmailVerification: boolean().default(false).notNull(),
  authRequireOrganization: boolean().default(true).notNull(),
  authRequireName: boolean().default(true).notNull(),
  analyticsSimpleAnalytics: boolean().default(false).notNull(),
  analyticsPlausibleAnalytics: boolean().default(false).notNull(),
  analyticsGoogleAnalyticsTrackingId: text(),
  subscriptionRequired: boolean().default(true).notNull(),
  subscriptionAllowSubscribeBeforeSignUp: boolean().default(true).notNull(),
  subscriptionAllowSignUpBeforeSubscribe: boolean().default(true).notNull(),
  brandingLogo: text(),
  brandingLogoDarkMode: text(),
  brandingIcon: text(),
  brandingIconDarkMode: text(),
  brandingFavicon: text(),
  headScripts: text(),
  bodyScripts: text(),
} as Record<string, any>)

export const userRole = pgTable(
  'UserRole',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    userId: text().notNull(),
    roleId: text().notNull(),
    tenantId: text(),
  } as Record<string, any>,
  (table) => [
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [role.id],
      name: 'UserRole_roleId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: 'UserRole_tenantId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'UserRole_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const role = pgTable(
  'Role',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    name: text().notNull(),
    description: text().notNull(),
    type: text().notNull(),
    assignToNewUsers: boolean().notNull(),
    isDefault: boolean().notNull(),
    order: integer().notNull(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('Role_name_key').using('btree', table.name.asc().nullsLast().op('text_ops')),
  ],
)

export const tenant = pgTable(
  'Tenant',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    slug: text().notNull(),
    name: text().notNull(),
    icon: text(),
    subscriptionId: text(),
    active: boolean().default(false).notNull(),
  } as Record<string, any>,
  (table) => [
    index('Tenant_slug_idx').using('btree', table.slug.asc().nullsLast().op('text_ops')),
    uniqueIndex('Tenant_slug_key').using('btree', table.slug.asc().nullsLast().op('text_ops')),
  ],
)

export const subscriptionUsageBasedPrice = pgTable(
  'SubscriptionUsageBasedPrice',
  {
    id: text().primaryKey().notNull(),
    subscriptionProductId: text().notNull(),
    stripeId: text().notNull(),
    billingPeriod: integer().notNull(),
    currency: text().notNull(),
    unit: text().notNull(),
    unitTitle: text().notNull(),
    unitTitlePlural: text().notNull(),
    usageType: text().notNull(),
    aggregateUsage: text().notNull(),
    tiersMode: text().notNull(),
    billingScheme: text().notNull(),
  } as Record<string, any>,
  (table) => [
    foreignKey({
      columns: [table.subscriptionProductId],
      foreignColumns: [subscriptionProduct.id],
      name: 'SubscriptionUsageBasedPrice_subscriptionProductId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const subscriptionUsageBasedTier = pgTable(
  'SubscriptionUsageBasedTier',
  {
    id: text().primaryKey().notNull(),
    subscriptionUsageBasedPriceId: text().notNull(),
    from: integer().notNull(),
    to: integer(),
    perUnitPrice: doublePrecision(),
    flatFeePrice: doublePrecision(),
  },
  (table) => [
    foreignKey({
      columns: [table.subscriptionUsageBasedPriceId],
      foreignColumns: [subscriptionUsageBasedPrice.id],
      name: 'SubscriptionUsageBasedTier_subscriptionUsageBasedPriceId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const subscriptionProduct = pgTable('SubscriptionProduct', {
  id: text().primaryKey().notNull(),
  stripeId: text().notNull(),
  order: integer().notNull(),
  title: text().notNull(),
  active: boolean().notNull(),
  model: integer().notNull(),
  public: boolean().notNull(),
  groupTitle: text(),
  groupDescription: text(),
  description: text(),
  badge: text(),
  billingAddressCollection: text().default('auto').notNull(),
  hasQuantity: boolean().default(false).notNull(),
  canBuyAgain: boolean().default(false).notNull(),
})

export const subscriptionFeature = pgTable(
  'SubscriptionFeature',
  {
    id: text().primaryKey().notNull(),
    subscriptionProductId: text().notNull(),
    order: integer().notNull(),
    title: text().notNull(),
    name: text().notNull(),
    type: integer().notNull(),
    value: integer().notNull(),
    href: text(),
    badge: text(),
    accumulate: boolean().default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.subscriptionProductId],
      foreignColumns: [subscriptionProduct.id],
      name: 'SubscriptionFeature_subscriptionProductId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const tenantSubscriptionProductPrice = pgTable(
  'TenantSubscriptionProductPrice',
  {
    id: text().primaryKey().notNull(),
    tenantSubscriptionProductId: text().notNull(),
    subscriptionPriceId: text(),
    subscriptionUsageBasedPriceId: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.tenantSubscriptionProductId],
      foreignColumns: [tenantSubscriptionProduct.id],
      name: 'TenantSubscriptionProductPrice_tenantSubscriptionProductId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.subscriptionPriceId],
      foreignColumns: [subscriptionPrice.id],
      name: 'TenantSubscriptionProductPrice_subscriptionPriceId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.subscriptionUsageBasedPriceId],
      foreignColumns: [subscriptionUsageBasedPrice.id],
      name: 'TenantSubscriptionProductPrice_subscriptionUsageBasedPrice_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
)

export const tenantSubscriptionUsageRecord = pgTable(
  'TenantSubscriptionUsageRecord',
  {
    id: text().primaryKey().notNull(),
    tenantSubscriptionProductPriceId: text().notNull(),
    timestamp: integer().notNull(),
    quantity: integer().notNull(),
    stripeSubscriptionItemId: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.tenantSubscriptionProductPriceId],
      foreignColumns: [tenantSubscriptionProductPrice.id],
      name: 'TenantSubscriptionUsageRecord_tenantSubscriptionProductPri_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const credit = pgTable(
  'Credit',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    tenantId: text().notNull(),
    userId: text(),
    amount: integer().notNull(),
    type: text().notNull(),
    objectId: text(),
  } as Record<string, any>,
  (table) => [
    index('Credit_tenantId_createdAt_idx').using(
      'btree',
      table.tenantId.asc().nullsLast().op('text_ops'),
      table.createdAt.asc().nullsLast().op('timestamptz_ops'),
    ),
    index('Credit_tenantId_userId_idx').using(
      'btree',
      table.tenantId.asc().nullsLast().op('text_ops'),
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: 'Credit_tenantId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'Credit_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
)

export const checkoutSessionStatus = pgTable(
  'CheckoutSessionStatus',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    pending: boolean().default(true).notNull(),
    email: text().notNull(),
    fromUrl: text().notNull(),
    fromUserId: text(),
    fromTenantId: text(),
    createdUserId: text(),
    createdTenantId: text(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('CheckoutSessionStatus_id_key').using(
      'btree',
      table.id.asc().nullsLast().op('text_ops'),
    ),
  ],
)

export const tenantSubscriptionProduct = pgTable(
  'TenantSubscriptionProduct',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    tenantSubscriptionId: text().notNull(),
    subscriptionProductId: text().notNull(),
    cancelledAt: timestamp({ precision: 3, mode: 'string' }),
    endsAt: timestamp({ precision: 3, mode: 'string' }),
    stripeSubscriptionId: text(),
    quantity: integer(),
    fromCheckoutSessionId: text(),
    currentPeriodStart: timestamp({ precision: 3, mode: 'string' }),
    currentPeriodEnd: timestamp({ precision: 3, mode: 'string' }),
  } as Record<string, any>,
  (table) => [
    foreignKey({
      columns: [table.tenantSubscriptionId],
      foreignColumns: [tenantSubscription.id],
      name: 'TenantSubscriptionProduct_tenantSubscriptionId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.subscriptionProductId],
      foreignColumns: [subscriptionProduct.id],
      name: 'TenantSubscriptionProduct_subscriptionProductId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ],
)

export const tenantUser = pgTable(
  'TenantUser',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    tenantId: text().notNull(),
    userId: text().notNull(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('TenantUser_tenantId_userId_key').using(
      'btree',
      table.tenantId.asc().nullsLast().op('text_ops'),
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: 'TenantUser_tenantId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'TenantUser_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const subscriptionPrice = pgTable(
  'SubscriptionPrice',
  {
    id: text().primaryKey().notNull(),
    subscriptionProductId: text().notNull(),
    stripeId: text().notNull(),
    type: integer().notNull(),
    billingPeriod: integer().notNull(),
    price: doublePrecision().notNull(),
    currency: text().notNull(),
    trialDays: integer().notNull(),
    active: boolean().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.subscriptionProductId],
      foreignColumns: [subscriptionProduct.id],
      name: 'SubscriptionPrice_subscriptionProductId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const tenantSubscription = pgTable(
  'TenantSubscription',
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    stripeCustomerId: text(),
  },
  (table) => [
    uniqueIndex('TenantSubscription_tenantId_key').using(
      'btree',
      table.tenantId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: 'TenantSubscription_tenantId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)
