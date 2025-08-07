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
  'user',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updated_at: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    email: text().notNull(),
    hash: text().notNull(),
    first_name: text().notNull(),
    last_name: text().notNull(),
    avatar: text(),
    phone: text(),
    default_tenant_id: text(),
    verify_token: text(),
    locale: text(),
    active: boolean().default(false).notNull(),
    admin: boolean().default(false).notNull(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('user_email_key').using('btree', table.email.asc().nullsLast().op('text_ops')),
  ],
)

export const tenant_user_invitation = pgTable(
  'tenant_user_invitation',
  {
    id: text().primaryKey().notNull(),
    tenant_id: text().notNull(),
    email: text().notNull(),
    first_name: text().notNull(),
    last_name: text().notNull(),
    pending: boolean().notNull(),
    created_userId: text(),
    from_userId: text(),
  },
  (table) => [
    uniqueIndex('tenant_user_invitation_created_user_id_key').using(
      'btree',
      table.created_user_id.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.from_user_id],
      foreignColumns: [user.id],
      name: 'tenant_user_invitation_from_user_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.created_user_id],
      foreignColumns: [user.id],
      name: 'tenant_user_invitation_created_user_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.tenant_id],
      foreignColumns: [tenant.id],
      name: 'tenant_user_invitation_tenant_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const user_registration_attempt = pgTable(
  'user_registration_attempt',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    email: text().notNull(),
    first_name: text().notNull(),
    last_name: text().notNull(),
    slug: text(),
    token: text().notNull(),
    ip_address: text(),
    company: text(),
    created_tenant_id: text(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('user_registration_attempt_created_tenant_id_key').using(
      'btree',
      table.created_tenant_id.asc().nullsLast().op('text_ops'),
    ),
    uniqueIndex('user_registration_attempt_email_key').using(
      'btree',
      table.email.asc().nullsLast().op('text_ops'),
    ),
    uniqueIndex('user_registration_attempt_token_key').using(
      'btree',
      table.token.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.created_tenant_id],
      foreignColumns: [tenant.id],
      name: 'user_registration_attempt_created_tenant_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const permission = pgTable(
  'permission',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updated_at: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    name: text().notNull(),
    description: text().notNull(),
    type: text().notNull(),
    is_default: boolean().notNull(),
    order: integer().notNull(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('permission_name_key').using('btree', table.name.asc().nullsLast().op('text_ops')),
  ],
)

export const role_permission = pgTable(
  'role_permission',
  {
    id: text().primaryKey().notNull(),
    role_id: text().notNull(),
    permission_id: text().notNull(),
  } as Record<string, any>,
  (table) => [
    foreignKey({
      columns: [table.permission_id],
      foreignColumns: [permission.id],
      name: 'role_permission_permission_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.role_id],
      foreignColumns: [role.id],
      name: 'role_permission_role_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const app_configuration = pgTable('app_configuration', {
  id: text().primaryKey().notNull(),
  updated_at: timestamp('updated_at', {
    mode: 'string',
    withTimezone: true,
    precision: 3,
  }).notNull(),
  name: text().notNull(),
  theme: text(),
  auth_required_email_verification: boolean().default(false).notNull(),
  auth_require_organization: boolean().default(true).notNull(),
  auth_require_name: boolean().default(true).notNull(),
  analytics_simple_analytics: boolean().default(false).notNull(),
  analytics_plausible_analytics: boolean().default(false).notNull(),
  analytics_google_analytics_tracking_id: text(),
  subscription_required: boolean().default(true).notNull(),
  subscription_allow_subscribe_before_sign_up: boolean().default(true).notNull(),
  subscription_allow_sign_up_before_subscribe: boolean().default(true).notNull(),
  branding_logo: text(),
  branding_logo_dark_mode: text(),
  branding_icon: text(),
  branding_icon_dark_mode: text(),
  branding_favicon: text(),
  head_scripts: text(),
  body_scripts: text(),
} as Record<string, any>)

export const user_role = pgTable(
  'user_role',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    userId: text().notNull(),
    role_id: text().notNull(),
    tenant_id: text(),
  } as Record<string, any>,
  (table) => [
    foreignKey({
      columns: [table.role_id],
      foreignColumns: [role.id],
      name: 'user_role_role_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.tenant_id],
      foreignColumns: [tenant.id],
      name: 'user_role_tenant_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [user.id],
      name: 'user_role_user_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const role = pgTable(
  'role',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updated_at: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    name: text().notNull(),
    description: text().notNull(),
    type: text().notNull(),
    assign_to_new_users: boolean().notNull(),
    is_default: boolean().notNull(),
    order: integer().notNull(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('role_name_key').using('btree', table.name.asc().nullsLast().op('text_ops')),
  ],
)

export const tenant = pgTable(
  'tenant',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updated_at: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    slug: text().notNull(),
    name: text().notNull(),
    icon: text(),
    subscription_id: text(),
    active: boolean().default(false).notNull(),
  } as Record<string, any>,
  (table) => [
    index('tenant_slug_idx').using('btree', table.slug.asc().nullsLast().op('text_ops')),
    uniqueIndex('tenant_slug_key').using('btree', table.slug.asc().nullsLast().op('text_ops')),
  ],
)

export const subscription_usage_based_price = pgTable(
  'subscription_usage_based_price',
  {
    id: text().primaryKey().notNull(),
    subscription_product_id: text().notNull(),
    stripe_id: text().notNull(),
    billing_period: integer().notNull(),
    currency: text().notNull(),
    unit: text().notNull(),
    unit_title: text().notNull(),
    unit_title_plural: text().notNull(),
    usage_type: text().notNull(),
    aggregate_usage: text().notNull(),
    tiers_mode: text().notNull(),
    billing_scheme: text().notNull(),
  } as Record<string, any>,
  (table) => [
    foreignKey({
      columns: [table.subscription_product_id],
      foreignColumns: [subscription_product.id],
      name: 'subscription_usage_based_price_subscription_product_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const subscription_usage_based_tier = pgTable(
  'subscription_usage_based_tier',
  {
    id: text().primaryKey().notNull(),
    subscription_usage_based_price_id: text().notNull(),
    from: integer().notNull(),
    to: integer(),
    per_unit_price: doublePrecision(),
    flat_fee_price: doublePrecision(),
  },
  (table) => [
    foreignKey({
      columns: [table.subscription_usage_based_price_id],
      foreignColumns: [subscription_usage_based_price.id],
      name: 'subscription_usage_based_tier_subscription_usage_based_price_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const subscription_product = pgTable('subscription_product', {
  id: text().primaryKey().notNull(),
  stripe_id: text().notNull(),
  order: integer().notNull(),
  title: text().notNull(),
  active: boolean().notNull(),
  model: integer().notNull(),
  public: boolean().notNull(),
  group_title: text(),
  group_description: text(),
  description: text(),
  badge: text(),
  billing_address_collection: text().default('auto').notNull(),
  has_quantity: boolean().default(false).notNull(),
  can_buy_again: boolean().default(false).notNull(),
})

export const subscription_feature = pgTable(
  'subscription_feature',
  {
    id: text().primaryKey().notNull(),
    subscription_product_id: text().notNull(),
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
      columns: [table.subscription_product_id],
      foreignColumns: [subscription_product.id],
      name: 'subscription_feature_subscription_product_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const tenant_subscription_product_price = pgTable(
  'tenant_subscription_product_price',
  {
    id: text().primaryKey().notNull(),
    tenant_subscription_product_id: text().notNull(),
    subscription_price_id: text(),
    subscription_usage_based_price_id: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.tenant_subscription_product_id],
      foreignColumns: [tenant_subscription_product.id],
      name: 'tenant_subscription_product_price_tenant_subscription_product_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.subscription_price_id],
      foreignColumns: [subscription_price.id],
      name: 'tenant_subscription_product_price_subscription_price_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.subscription_usage_based_price_id],
      foreignColumns: [subscription_usage_based_price.id],
      name: 'tenant_subscription_product_price_subscription_usage_based_price_fk',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
)

export const tenant_subscription_usage_record = pgTable(
  'tenant_subscription_usage_record',
  {
    id: text().primaryKey().notNull(),
    tenant_subscription_product_price_id: text().notNull(),
    timestamp: integer().notNull(),
    quantity: integer().notNull(),
    stripe_subscription_item_id: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.tenant_subscription_product_price_id],
      foreignColumns: [tenant_subscription_product_price.id],
      name: 'tenant_subscription_usage_record_tenant_subscription_product_price_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const credit = pgTable(
  'credit',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    tenant_id: text().notNull(),
    userId: text(),
    amount: integer().notNull(),
    type: text().notNull(),
    object_id: text(),
  } as Record<string, any>,
  (table) => [
    index('credit_tenant_id_created_at_idx').using(
      'btree',
      table.tenant_id.asc().nullsLast().op('text_ops'),
      table.created_at.asc().nullsLast().op('timestamptz_ops'),
    ),
    index('credit_tenant_id_user_id_idx').using(
      'btree',
      table.tenant_id.asc().nullsLast().op('text_ops'),
      table.user_id.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.tenant_id],
      foreignColumns: [tenant.id],
      name: 'credit_tenant_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [user.id],
      name: 'credit_user_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
)

export const checkout_session_status = pgTable(
  'checkout_session_status',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updated_at: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
      precision: 3,
    }).notNull(),
    pending: boolean().default(true).notNull(),
    email: text().notNull(),
    from_url: text().notNull(),
    from_userId: text(),
    from_tenant_id: text(),
    created_userId: text(),
    created_tenant_id: text(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('checkout_session_status_id_key').using(
      'btree',
      table.id.asc().nullsLast().op('text_ops'),
    ),
  ],
)

export const tenant_subscription_product = pgTable(
  'tenant_subscription_product',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    tenant_subscription_id: text().notNull(),
    subscription_product_id: text().notNull(),
    cancelled_at: timestamp({ precision: 3, mode: 'string' }),
    ends_at: timestamp({ precision: 3, mode: 'string' }),
    stripe_subscription_id: text(),
    quantity: integer(),
    from_checkout_session_id: text(),
    current_period_start: timestamp({ precision: 3, mode: 'string' }),
    current_period_end: timestamp({ precision: 3, mode: 'string' }),
  } as Record<string, any>,
  (table) => [
    foreignKey({
      columns: [table.tenant_subscription_id],
      foreignColumns: [tenant_subscription.id],
      name: 'tenant_subscription_product_tenant_subscription_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.subscription_product_id],
      foreignColumns: [subscription_product.id],
      name: 'tenant_subscription_product_subscription_product_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ],
)

export const tenant_user = pgTable(
  'tenant_user',
  {
    id: text().primaryKey().notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true, precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    tenant_id: text().notNull(),
    userId: text().notNull(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('tenant_user_tenant_id_user_id_key').using(
      'btree',
      table.tenant_id.asc().nullsLast().op('text_ops'),
      table.user_id.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.tenant_id],
      foreignColumns: [tenant.id],
      name: 'tenant_user_tenant_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [user.id],
      name: 'tenant_user_user_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const subscription_price = pgTable(
  'subscription_price',
  {
    id: text().primaryKey().notNull(),
    subscription_product_id: text().notNull(),
    stripe_id: text().notNull(),
    type: integer().notNull(),
    billing_period: integer().notNull(),
    price: doublePrecision().notNull(),
    currency: text().notNull(),
    trial_days: integer().notNull(),
    active: boolean().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.subscription_product_id],
      foreignColumns: [subscription_product.id],
      name: 'subscription_price_subscription_product_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const tenant_subscription = pgTable(
  'tenant_subscription',
  {
    id: text().primaryKey().notNull(),
    tenant_id: text().notNull(),
    stripe_customer_id: text(),
  },
  (table) => [
    uniqueIndex('tenant_subscription_tenant_id_key').using(
      'btree',
      table.tenant_id.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.tenant_id],
      foreignColumns: [tenant.id],
      name: 'tenant_subscription_tenant_id_fk',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)
