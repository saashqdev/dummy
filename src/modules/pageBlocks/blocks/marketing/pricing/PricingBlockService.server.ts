import Stripe from 'stripe'
import { PricingModel } from '@/modules/subscriptions/enums/PricingModel'
import defaultPlans from '@/modules/subscriptions/data/defaultPlans.server'
import { stripeService } from '@/modules/subscriptions/services/StripeService'
import { getBaseURL } from '@/lib/services/url.server'
import { PricingBlockData } from './PricingBlockDto'
import PricingUtils from '@/modules/subscriptions/utils/PricingUtils'
import { TFunction } from 'i18next'
import { getPlanFromForm } from '@/modules/subscriptions/services/SubscriptionService'
import { db } from '@/db'
import { getServerTranslations } from '@/i18n/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { ISearchParams } from '@/lib/dtos/ServerComponentsProps'

export namespace PricingBlockService {
  export async function load({ searchParams }: { searchParams: ISearchParams | undefined }) {
    const { t } = await getServerTranslations()
    let items = await db.subscription_product.getAllSubscriptionProducts(true)
    const couponParam = searchParams?.coupon?.toString()
    const planParam = searchParams?.plan?.toString()
    if (planParam) {
      items = await db.subscription_product.getSubscriptionProductsInIds([planParam])
    }
    let coupon: { error?: string; stripeCoupon?: Stripe.Coupon | null } | undefined = undefined
    if (couponParam) {
      try {
        const stripeCoupon = await stripeService.getStripeCoupon(couponParam)
        if (!stripeCoupon) {
          throw Error(t('pricing.coupons.invalid'))
        }
        if (
          stripeCoupon.max_redemptions &&
          stripeCoupon.times_redeemed > stripeCoupon.max_redemptions
        ) {
          throw Error(t('pricing.coupons.expired'))
        }
        if (!stripeCoupon.valid) {
          throw Error(t('pricing.coupons.invalid'))
        }
        coupon = { stripeCoupon }
      } catch (e: any) {
        coupon = { error: e.message }
      }
    }
    const debugPricingModel = searchParams?.model?.toString()
    const debugModel: PricingModel = debugPricingModel
      ? (Number(debugPricingModel) as PricingModel)
      : PricingModel.FLAT_RATE

    let defaultCurrency = PricingUtils.getDefaultCurrency(searchParams)
    let defaultBillingPeriod = PricingUtils.getDefaultBillingPeriod(searchParams)

    const filteredItems =
      items.length > 0
        ? items
        : defaultPlans.filter((f) => f.model === debugModel || debugModel === PricingModel.ALL)
    const currenciesAndPeriod = PricingUtils.getCurrenciesAndPeriods(
      filteredItems.flatMap((f) => f.prices),
      defaultCurrency,
      defaultBillingPeriod,
    )
    const data: PricingBlockData = {
      items: filteredItems,
      coupon,
      currenciesAndPeriod,
    }
    return data
  }
  export async function subscribe({ form }: { form: FormData; t: TFunction }) {
    const selectedPlan = await getPlanFromForm(form)
    const heads = await headers()
    const currentUrl = heads.get('x-url')?.toLowerCase() || '/'
    const response = await stripeService
      .createStripeCheckoutSession({
        subscription_product: selectedPlan.product,
        line_items: selectedPlan.line_items,
        mode: selectedPlan.mode,
        success_url: `${await getBaseURL()}/pricing/{CHECKOUT_SESSION_ID}/success`,
        cancel_url: `${currentUrl}`,
        freeTrialDays: selectedPlan.freeTrialDays,
        coupon: selectedPlan.coupon,
        referral: selectedPlan.referral,
      })
      .then((session) => {
        return session
      })
      .catch((e) => {
        console.log(e)
        return { error: e.message }
      })
    if ('error' in response) {
      return { error: response.error }
    }
    return redirect(response.url ?? '')
  }
}
