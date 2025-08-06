import { SubscriptionFeatureModel } from '@/db/models'
import { SubscriptionFeatureLimitType } from '@/modules/subscriptions/enums/SubscriptionFeatureLimitType'

export interface ISubscriptionFeatureDb {
  getAll(): Promise<SubscriptionFeatureModel[]>
  get(id: string): Promise<SubscriptionFeatureModel | null>
  create(
    subscription_product_id: string,
    data: {
      order: number
      title: string
      name: string
      type: SubscriptionFeatureLimitType
      value: number
      href?: string | null
      badge?: string | null
      accumulate?: boolean
    },
  ): Promise<string>
  deleteBySubscriptionProductId(subscription_product_id: string): Promise<void>
}
