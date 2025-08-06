import { relations } from "drizzle-orm/relations";
import { user, tenantUserInvitation, tenant, userRegistrationAttempt, permission, rolePermission, role, userRole, subscriptionProduct, subscriptionUsageBasedPrice, subscriptionUsageBasedTier, subscriptionFeature, tenantSubscriptionProduct, tenantSubscriptionProductPrice, subscriptionPrice, tenantSubscriptionUsageRecord, credit, tenantSubscription, tenantUser } from "./schema";

export const tenantUserInvitationRelations = relations(tenantUserInvitation, ({one}) => ({
	user_fromUserId: one(user, {
		fields: [tenantUserInvitation.fromUserId],
		references: [user.id],
		relationName: "tenantUserInvitation_fromUserId_user_id"
	}),
	user_createdUserId: one(user, {
		fields: [tenantUserInvitation.createdUserId],
		references: [user.id],
		relationName: "tenantUserInvitation_createdUserId_user_id"
	}),
	tenant: one(tenant, {
		fields: [tenantUserInvitation.tenantId],
		references: [tenant.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	tenantUserInvitations_fromUserId: many(tenantUserInvitation, {
		relationName: "tenantUserInvitation_fromUserId_user_id"
	}),
	tenantUserInvitations_createdUserId: many(tenantUserInvitation, {
		relationName: "tenantUserInvitation_createdUserId_user_id"
	}),
	userRoles: many(userRole),
	credits: many(credit),
	tenantUsers: many(tenantUser),
}));

export const tenantRelations = relations(tenant, ({many}) => ({
	tenantUserInvitations: many(tenantUserInvitation),
	userRegistrationAttempts: many(userRegistrationAttempt),
	userRoles: many(userRole),
	credits: many(credit),
	tenantUsers: many(tenantUser),
	tenantSubscriptions: many(tenantSubscription),
}));

export const userRegistrationAttemptRelations = relations(userRegistrationAttempt, ({one}) => ({
	tenant: one(tenant, {
		fields: [userRegistrationAttempt.createdTenantId],
		references: [tenant.id]
	}),
}));

export const rolePermissionRelations = relations(rolePermission, ({one}) => ({
	permission: one(permission, {
		fields: [rolePermission.permissionId],
		references: [permission.id]
	}),
	role: one(role, {
		fields: [rolePermission.roleId],
		references: [role.id]
	}),
}));

export const permissionRelations = relations(permission, ({many}) => ({
	rolePermissions: many(rolePermission),
}));

export const roleRelations = relations(role, ({many}) => ({
	rolePermissions: many(rolePermission),
	userRoles: many(userRole),
}));

export const userRoleRelations = relations(userRole, ({one}) => ({
	role: one(role, {
		fields: [userRole.roleId],
		references: [role.id]
	}),
	tenant: one(tenant, {
		fields: [userRole.tenantId],
		references: [tenant.id]
	}),
	user: one(user, {
		fields: [userRole.userId],
		references: [user.id]
	}),
}));

export const subscriptionUsageBasedPriceRelations = relations(subscriptionUsageBasedPrice, ({one, many}) => ({
	subscriptionProduct: one(subscriptionProduct, {
		fields: [subscriptionUsageBasedPrice.subscriptionProductId],
		references: [subscriptionProduct.id]
	}),
	subscriptionUsageBasedTiers: many(subscriptionUsageBasedTier),
	tenantSubscriptionProductPrices: many(tenantSubscriptionProductPrice),
}));

export const subscriptionProductRelations = relations(subscriptionProduct, ({many}) => ({
	subscriptionUsageBasedPrices: many(subscriptionUsageBasedPrice),
	subscriptionFeatures: many(subscriptionFeature),
	tenantSubscriptionProducts: many(tenantSubscriptionProduct),
	subscriptionPrices: many(subscriptionPrice),
}));

export const subscriptionUsageBasedTierRelations = relations(subscriptionUsageBasedTier, ({one}) => ({
	subscriptionUsageBasedPrice: one(subscriptionUsageBasedPrice, {
		fields: [subscriptionUsageBasedTier.subscriptionUsageBasedPriceId],
		references: [subscriptionUsageBasedPrice.id]
	}),
}));

export const subscriptionFeatureRelations = relations(subscriptionFeature, ({one}) => ({
	subscriptionProduct: one(subscriptionProduct, {
		fields: [subscriptionFeature.subscriptionProductId],
		references: [subscriptionProduct.id]
	}),
}));

export const tenantSubscriptionProductPriceRelations = relations(tenantSubscriptionProductPrice, ({one, many}) => ({
	tenantSubscriptionProduct: one(tenantSubscriptionProduct, {
		fields: [tenantSubscriptionProductPrice.tenantSubscriptionProductId],
		references: [tenantSubscriptionProduct.id]
	}),
	subscriptionPrice: one(subscriptionPrice, {
		fields: [tenantSubscriptionProductPrice.subscriptionPriceId],
		references: [subscriptionPrice.id]
	}),
	subscriptionUsageBasedPrice: one(subscriptionUsageBasedPrice, {
		fields: [tenantSubscriptionProductPrice.subscriptionUsageBasedPriceId],
		references: [subscriptionUsageBasedPrice.id]
	}),
	tenantSubscriptionUsageRecords: many(tenantSubscriptionUsageRecord),
}));

export const tenantSubscriptionProductRelations = relations(tenantSubscriptionProduct, ({one, many}) => ({
	tenantSubscriptionProductPrices: many(tenantSubscriptionProductPrice),
	tenantSubscription: one(tenantSubscription, {
		fields: [tenantSubscriptionProduct.tenantSubscriptionId],
		references: [tenantSubscription.id]
	}),
	subscriptionProduct: one(subscriptionProduct, {
		fields: [tenantSubscriptionProduct.subscriptionProductId],
		references: [subscriptionProduct.id]
	}),
}));

export const subscriptionPriceRelations = relations(subscriptionPrice, ({one, many}) => ({
	tenantSubscriptionProductPrices: many(tenantSubscriptionProductPrice),
	subscriptionProduct: one(subscriptionProduct, {
		fields: [subscriptionPrice.subscriptionProductId],
		references: [subscriptionProduct.id]
	}),
}));

export const tenantSubscriptionUsageRecordRelations = relations(tenantSubscriptionUsageRecord, ({one}) => ({
	tenantSubscriptionProductPrice: one(tenantSubscriptionProductPrice, {
		fields: [tenantSubscriptionUsageRecord.tenantSubscriptionProductPriceId],
		references: [tenantSubscriptionProductPrice.id]
	}),
}));

export const creditRelations = relations(credit, ({one}) => ({
	tenant: one(tenant, {
		fields: [credit.tenantId],
		references: [tenant.id]
	}),
	user: one(user, {
		fields: [credit.userId],
		references: [user.id]
	}),
}));

export const tenantSubscriptionRelations = relations(tenantSubscription, ({one, many}) => ({
	tenantSubscriptionProducts: many(tenantSubscriptionProduct),
	tenant: one(tenant, {
		fields: [tenantSubscription.tenantId],
		references: [tenant.id]
	}),
}));

export const tenantUserRelations = relations(tenantUser, ({one}) => ({
	tenant: one(tenant, {
		fields: [tenantUser.tenantId],
		references: [tenant.id]
	}),
	user: one(user, {
		fields: [tenantUser.userId],
		references: [user.id]
	}),
}));