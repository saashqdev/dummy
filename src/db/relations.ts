import { relations } from 'drizzle-orm/relations'
import {
  subscription_product,
  subscription_usage_based_price,
  subscription_usage_based_tier,
  subscription_feature,
  subscription_price,
  credit,
} from './schema'

export const relations_subscription_usage_based_price = relations(
  subscription_usage_based_price,
  ({ one, many }) => ({
    subscription_product: one(subscription_product, {
      fields: [subscription_usage_based_price.subscription_product_id],
      references: [subscription_product.id],
    }),
    subscription_usage_based_tiers: many(subscription_usage_based_tier),
  }),
)

export const relations_subscription_product = relations(subscription_product, ({ many }) => ({
  subscription_usage_based_prices: many(subscription_usage_based_price),
  subscription_features: many(subscription_feature),
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

export const relations_subscription_price = relations(subscription_price, ({ one, many }) => ({
  subscription_product: one(subscription_product, {
    fields: [subscription_price.subscription_product_id],
    references: [subscription_product.id],
  }),
}))
