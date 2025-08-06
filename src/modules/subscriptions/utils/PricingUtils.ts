import { SubscriptionPriceDto } from '@/modules/subscriptions/dtos/SubscriptionPriceDto'
import { SubscriptionBillingPeriod } from '@/modules/subscriptions/enums/SubscriptionBillingPeriod'
import billing_periods from '@/modules/subscriptions/data/billing_periods'
import currencies from '@/modules/subscriptions/data/currencies'
import { ISearchParams } from '@/lib/dtos/ServerComponentsProps'

function getYearlyDiscount(prices: SubscriptionPriceDto[], currency: string) {
  const priceYearly = prices.find(
    (f) =>
      f.billing_period === SubscriptionBillingPeriod.YEARLY &&
      Number(f.price) > 0 &&
      f.currency === currency,
  )
  const priceMonthly = prices.find(
    (f) =>
      f.billing_period === SubscriptionBillingPeriod.MONTHLY &&
      Number(f.price) > 0 &&
      f.currency === currency,
  )
  if (priceYearly?.price && priceMonthly?.price) {
    const discount = 100 - (Number(priceYearly.price) * 100) / (Number(priceMonthly.price) * 12)
    if (discount !== 0) {
      return '-' + discount.toFixed(0) + '%'
    }
  }
  return undefined
}

function getSortedBillingPeriods(items: SubscriptionBillingPeriod[]) {
  const sorted: SubscriptionBillingPeriod[] = []
  billing_periods.forEach((billing_period) => {
    if (items.includes(billing_period.value) && !sorted.includes(billing_period.value)) {
      sorted.push(billing_period.value)
    }
  })
  return sorted
}

function getSortedCurrencies(items: string[]) {
  const sorted: string[] = []
  currencies
    .filter((f) => !f.disabled)
    .forEach((currency) => {
      if (items.includes(currency.value) && !sorted.includes(currency.value)) {
        sorted.push(currency.value)
      }
    })
  return sorted
}

function getPossibleBillingPeriods(prices: SubscriptionPriceDto[]) {
  let periods = prices.filter((f) => f.price).flatMap((f) => f.billing_period)
  // remove duplicates
  periods = periods.filter((v, i, a) => a.indexOf(v) === i)
  return getSortedBillingPeriods(periods)
}

function getPossibleCurrencies(prices: SubscriptionPriceDto[]) {
  let currencies = prices.filter((f) => f.price).flatMap((f) => f.currency)
  // remove duplicates
  currencies = currencies.filter((v, i, a) => a.indexOf(v) === i)
  return getSortedCurrencies(currencies)
}

function getCurrenciesAndPeriods(
  prices: SubscriptionPriceDto[],
  defaultCurrency?: string,
  defaultBillingPeriod?: SubscriptionBillingPeriod,
) {
  if (!defaultCurrency) {
    defaultCurrency = currencies.find((f) => f.default)?.value ?? 'usd'
  }
  if (!defaultBillingPeriod) {
    defaultBillingPeriod =
      billing_periods.find((f) => f.default)?.value ?? SubscriptionBillingPeriod.MONTHLY
  }

  const currencyState: { value: string; options: string[] } = {
    value: defaultCurrency,
    options: getPossibleCurrencies(prices),
  }
  if (!currencyState.options.includes(defaultCurrency) && currencyState.options.length > 0) {
    currencyState.value = currencyState.options[0]
  }
  const billing_periodState: {
    value: SubscriptionBillingPeriod
    options: SubscriptionBillingPeriod[]
  } = {
    value: defaultBillingPeriod,
    options: getPossibleBillingPeriods(prices).filter((f) => f !== SubscriptionBillingPeriod.ONCE),
  }
  if (
    !billing_periodState.options.includes(defaultBillingPeriod) &&
    billing_periodState.options.length > 0
  ) {
    billing_periodState.value = billing_periodState.options[0]
  }

  return {
    currencies: currencyState,
    billing_periods: billing_periodState,
  }
}

function getBillingPeriodParams(billing_period: SubscriptionBillingPeriod) {
  switch (billing_period) {
    case SubscriptionBillingPeriod.ONCE:
      return 'o'
    case SubscriptionBillingPeriod.DAILY:
      return 'd'
    case SubscriptionBillingPeriod.WEEKLY:
      return 'w'
    case SubscriptionBillingPeriod.MONTHLY:
      return 'm'
    case SubscriptionBillingPeriod.YEARLY:
      return 'y'
    case SubscriptionBillingPeriod.QUARTERLY:
      return 'q'
    case SubscriptionBillingPeriod.SEMI_ANNUAL:
      return 's'
    default:
      return 'm'
  }
}

function getDefaultCurrency(searchParams?: ISearchParams) {
  let defaultCurrency = currencies.find((f) => f.default)?.value ?? ''
  if (searchParams?.c) {
    defaultCurrency = searchParams.c?.toString() ?? ''
  }
  return defaultCurrency
}

function getDefaultBillingPeriod(searchParams?: ISearchParams) {
  let defaultBillingPeriod =
    billing_periods.find((f) => f.default)?.value ?? SubscriptionBillingPeriod.MONTHLY
  if (searchParams?.b) {
    switch (searchParams.b) {
      case 'o':
        defaultBillingPeriod = SubscriptionBillingPeriod.ONCE
        break
      case 'd':
        defaultBillingPeriod = SubscriptionBillingPeriod.DAILY
        break
      case 'w':
        defaultBillingPeriod = SubscriptionBillingPeriod.WEEKLY
        break
      case 'm':
        defaultBillingPeriod = SubscriptionBillingPeriod.MONTHLY
        break
      case 'y':
        defaultBillingPeriod = SubscriptionBillingPeriod.YEARLY
        break
      case 'q':
        defaultBillingPeriod = SubscriptionBillingPeriod.QUARTERLY
        break
      case 's':
        defaultBillingPeriod = SubscriptionBillingPeriod.SEMI_ANNUAL
        break
    }
  }
  return defaultBillingPeriod
}

function getFormattedPriceInCurrency({
  price,
  currency,
  decimals = 2,
  withSymbol = true,
}: {
  price: number
  currency: string | undefined
  decimals?: number
  withSymbol?: boolean
}) {
  let currencyDetails =
    currencies.find((c) => c.value.toLowerCase() === currency?.toLowerCase()) ||
    currencies.find((c) => c.default)
  if (!currencyDetails) {
    // default
    currencyDetails = currencies.find((f) => f.default)
  }
  if (!currencyDetails) {
    return 'Currency not supported: ' + currency
  }

  const formattedPrice = formatPrice(
    price,
    currencyDetails.thousandSeparator,
    currencyDetails.decimalSeparator,
    decimals,
  )
  if (!withSymbol) {
    return formattedPrice
  }
  return currencyDetails.symbolRight
    ? `${formattedPrice}${currencyDetails.symbol}`
    : `${currencyDetails.symbol}${formattedPrice}`
}

function formatPrice(
  price: number,
  thousandSeparator: string = ',',
  decimalSeparator: string = '.',
  decimals: number = 2,
) {
  return price
    .toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    .replace(/,/g, thousandSeparator)
    .replace(/\./g, decimalSeparator)
}

export default {
  getYearlyDiscount,
  getSortedBillingPeriods,
  getSortedCurrencies,
  getCurrenciesAndPeriods,
  getBillingPeriodParams,
  getDefaultCurrency,
  getDefaultBillingPeriod,
  getFormattedPriceInCurrency,
}
