import { relations } from 'drizzle-orm/relations'
import {
  user,
  tenant_user_invitation,
  tenant,
  user_registration_attempt,
  permission,
  role_permission,
  role,
  user_role,
  subscription_product,
  subscription_usage_based_price,
  subscription_usage_based_tier,
  subscription_feature,
  tenant_subscription_product,
  tenant_subscription_product_price,
  subscription_price,
  tenant_subscription_usage_record,
  credit,
  tenant_subscription,
  tenant_user,
} from './schema'

export const relations_tenant_user_invitation = relations(tenant_user_invitation, ({ one }) => ({
  user_from_user_id: one(user, {
    fields: [tenant_user_invitation.from_user_id],
    references: [user.id],
    relationName: 'tenant_user_invitation_from_user_id_user_id',
  }),
  user_created_user_id: one(user, {
    fields: [tenant_user_invitation.created_user_id],
    references: [user.id],
    relationName: 'tenant_user_invitation_created_user_id_user_id',
  }),
  tenant: one(tenant, {
    fields: [tenant_user_invitation.tenant_id],
    references: [tenant.id],
  }),
}))

export const relations_user = relations(user, ({ many }) => ({
  tenant_user_invitations_from_user_id: many(tenant_user_invitation, {
    relationName: 'tenant_user_invitation_from_user_id_user_id',
  }),
  tenant_user_invitations_created_user_id: many(tenant_user_invitation, {
    relationName: 'tenant_user_invitation_created_user_id_user_id',
  }),
  user_roles: many(user_role),
  credits: many(credit),
  tenant_users: many(tenant_user),
}))

export const relations_tenant = relations(tenant, ({ many }) => ({
  tenant_user_invitations: many(tenant_user_invitation),
  user_registration_attempts: many(user_registration_attempt),
  user_roles: many(user_role),
  credits: many(credit),
  tenant_users: many(tenant_user),
  tenant_subscriptions: many(tenant_subscription),
}))

export const relations_user_registration_attempt = relations(
  user_registration_attempt,
  ({ one }) => ({
    tenant: one(tenant, {
      fields: [user_registration_attempt.created_tenant_id],
      references: [tenant.id],
    }),
  }),
)

export const relations_role_permission = relations(role_permission, ({ one }) => ({
  permission: one(permission, {
    fields: [role_permission.permission_id],
    references: [permission.id],
  }),
  role: one(role, {
    fields: [role_permission.role_id],
    references: [role.id],
  }),
}))

export const relations_permission = relations(permission, ({ many }) => ({
  role_permissions: many(role_permission),
}))

export const relations_role = relations(role, ({ many }) => ({
  role_permissions: many(role_permission),
  user_roles: many(user_role),
}))

export const relations_user_role = relations(user_role, ({ one }) => ({
  role: one(role, {
    fields: [user_role.role_id],
    references: [role.id],
  }),
  tenant: one(tenant, {
    fields: [user_role.tenant_id],
    references: [tenant.id],
  }),
  user: one(user, {
    fields: [user_role.user_id],
    references: [user.id],
  }),
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
  tenant: one(tenant, {
    fields: [credit.tenant_id],
    references: [tenant.id],
  }),
  user: one(user, {
    fields: [credit.user_id],
    references: [user.id],
  }),
}))

export const relations_tenant_subscription = relations(tenant_subscription, ({ one, many }) => ({
  tenant_subscription_products: many(tenant_subscription_product),
  tenant: one(tenant, {
    fields: [tenant_subscription.tenant_id],
    references: [tenant.id],
  }),
}))

export const relations_tenant_user = relations(tenant_user, ({ one }) => ({
  tenant: one(tenant, {
    fields: [tenant_user.tenant_id],
    references: [tenant.id],
  }),
  user: one(user, {
    fields: [tenant_user.user_id],
    references: [user.id],
  }),
}))
