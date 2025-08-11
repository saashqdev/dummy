import payload from 'payload'
import { relations } from 'drizzle-orm/relations'
import {
  permission,
  role_permission,
  subscription_product,
  subscription_usage_based_price,
  subscription_usage_based_tier,
  subscription_feature,
  subscription_price,
  credit,
  tenant_user_invitation,
  user_registration_attempt,
  tenant_subscription_product_price,
  tenant_subscription_usage_record,
  tenant_subscription_product,
  tenant_subscription,
  tenant_user,
  user_role,
} from './schema'

export const relations_tenant_user_invitation = relations(tenant_user_invitation, ({ one }) => ({
  user_from_user_id: one(payload.db.tables.users, {
    fields: [tenant_user_invitation.from_user_id],
    references: [payload.db.tables.users.user_id],
    relationName: 'tenant_user_invitation_from_user_id_user_id',
  }),
  user_created_user_id: one(payload.db.tables.users, {
    fields: [tenant_user_invitation.created_user_id],
    references: [payload.db.tables.users.user_id],
    relationName: 'tenant_user_invitation_created_user_id_user_id',
  }),
  tenant: one(payload.db.tables.tenants, {
    fields: [tenant_user_invitation.tenant_id],
    references: [payload.db.tables.tenants.tenant_id],
  }),
}))

export const relations_user_registration_attempt = relations(
  user_registration_attempt,
  ({ one }) => ({
    tenant: one(payload.db.tables.tenants, {
      fields: [user_registration_attempt.created_tenant_id],
      references: [payload.db.tables.tenants.tenant_id],
    }),
  }),
)

export const relations_role_permission = relations(role_permission, ({ one }) => ({
  permission: one(permission, {
    fields: [role_permission.permission_id],
    references: [permission.id],
  }),
  role: one(payload.db.tables.roles, {
    fields: [role_permission.role_id],
    references: [payload.db.tables.roles.role_id],
  }),
}))

export const relations_permission = relations(permission, ({ many }) => ({
  role_permissions: many(role_permission),
}))

export const relations_subscription_usage_based_price = relations(
  subscription_usage_based_price,
  ({ one, many }) => ({
    subscription_product: one(subscription_product, {
      fields: [subscription_usage_based_price.subscription_product_id],
      references: [subscription_product.id],
    }),
    subscription_usage_based_tiers: many(subscription_usage_based_tier),
    tenant_subscription_product_prices: many(tenant_subscription_product_price),
  }),
)

export const relations_subscription_product = relations(subscription_product, ({ many }) => ({
  subscription_usage_based_prices: many(subscription_usage_based_price),
  subscription_features: many(subscription_feature),
  tenant_subscription_products: many(tenant_subscription_product),
  subscription_prices: many(subscription_price),
}))

export const relations_usage_based_tier = relations(subscription_usage_based_tier, ({ one }) => ({
  subscription_usage_based_price: one(subscription_usage_based_price, {
    fields: [subscription_usage_based_tier.subscription_usage_based_price_id],
    references: [subscription_usage_based_price.id],
  }),
}))

export const relations_subscription_feature = relations(subscription_feature, ({ one }) => ({
  subscription_product: one(subscription_product, {
    fields: [subscription_feature.subscription_product_id],
    references: [subscription_product.id],
  }),
}))

export const relations_tenant_subscription_product_price = relations(
  tenant_subscription_product_price,
  ({ one, many }) => ({
    tenant_subscription_product: one(tenant_subscription_product, {
      fields: [tenant_subscription_product_price.tenant_subscription_product_id],
      references: [tenant_subscription_product.id],
    }),
    subscription_price: one(subscription_price, {
      fields: [tenant_subscription_product_price.subscription_price_id],
      references: [subscription_price.id],
    }),
    subscription_usage_based_price: one(subscription_usage_based_price, {
      fields: [tenant_subscription_product_price.subscription_usage_based_price_id],
      references: [subscription_usage_based_price.id],
    }),
    tenant_subscription_usage_records: many(tenant_subscription_usage_record),
  }),
)

export const relations_tenant_subscription_product = relations(
  tenant_subscription_product,
  ({ one, many }) => ({
    tenant_subscription_product_prices: many(tenant_subscription_product_price),
    tenant_subscription: one(tenant_subscription, {
      fields: [tenant_subscription_product.tenant_subscription_id],
      references: [tenant_subscription.id],
    }),
    subscription_product: one(subscription_product, {
      fields: [tenant_subscription_product.subscription_product_id],
      references: [subscription_product.id],
    }),
  }),
)

export const relations_subscription_price = relations(subscription_price, ({ one, many }) => ({
  tenant_subscription_product_prices: many(tenant_subscription_product_price),
  subscription_product: one(subscription_product, {
    fields: [subscription_price.subscription_product_id],
    references: [subscription_product.id],
  }),
}))

export const relations_tenant_subscription_usage_record = relations(
  tenant_subscription_usage_record,
  ({ one }) => ({
    tenant_subscription_product_price: one(tenant_subscription_product_price, {
      fields: [tenant_subscription_usage_record.tenant_subscription_product_price_id],
      references: [tenant_subscription_product_price.id],
    }),
  }),
)

export const relations_credit = relations(credit, ({ one }) => ({
  tenant: one(payload.db.tables.tenants, {
    fields: [credit.tenant_id],
    references: [payload.db.tables.tenants.tenant_id],
  }),
  user: one(payload.db.tables.users, {
    fields: [credit.userId],
    references: [payload.db.tables.users.user_id],
  }),
}))

export const relations_tenant_subscription = relations(tenant_subscription, ({ one, many }) => ({
  tenant_subscription_products: many(tenant_subscription_product),
  tenant: one(payload.db.tables.tenants, {
    fields: [tenant_subscription.tenant_id],
    references: [payload.db.tables.tenants.tenant_id],
  }),
}))

export const relations_tenant_user = relations(tenant_user, ({ one }) => ({
  tenant: one(payload.db.tables.tenants, {
    fields: [tenant_user.tenant_id],
    references: [payload.db.tables.tenants.tenant_id],
  }),
  user: one(payload.db.tables.users, {
    fields: [tenant_user.userId],
    references: [payload.db.tables.users.user_id],
  }),
}))

export const relations_user_role = relations(user_role, ({ one }) => ({
  role: one(payload.db.tables.roles, {
    fields: [payload.db.tables.user_role.role_id],
    references: [payload.db.tables.roles.role_id],
  }),
  tenant: one(payload.db.tables.tenants, {
    fields: [payload.db.tables.user_role.tenant_id],
    references: [payload.db.tables.tenants.tenant_id],
  }),
  user: one(payload.db.tables.users, {
    fields: [payload.db.tables.user_role.userId],
    references: [payload.db.tables.users.user_id],
  }),
}))
