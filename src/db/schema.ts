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
      table.userId.asc().nullsLast().op('text_ops'),
    ),
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
    from_user_id: text(),
    from_tenant_id: text(),
    created_user_id: text(),
    created_tenant_id: text(),
  } as Record<string, any>,
  (table) => [
    uniqueIndex('checkout_session_status_id_key').using(
      'btree',
      table.id.asc().nullsLast().op('text_ops'),
    ),
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
