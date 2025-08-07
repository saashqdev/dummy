'use client'

import { useTranslation } from 'react-i18next'
import DateUtils from '@/lib/utils/DateUtils'
import TableSimple, {
  RowHeaderActionDto,
  RowHeaderDisplayDto,
} from '@/components/ui/tables/TableSimple'
import { TenantWithDetailsDto } from '@/db/models'
import { PaginationDto } from '@/lib/dtos/PaginationDto'
import NumberUtils from '@/lib/utils/NumberUtils'
import SubscriptionUtils from '@/modules/subscriptions/utils/SubscriptionUtils'
import SimpleBadge from '@/components/ui/badges/SimpleBadge'
import { Colors } from '@/lib/colors'
import Stripe from 'stripe'
import Link from 'next/link'

interface Props {
  items: TenantWithDetailsDto[]
  pagination: PaginationDto
  tenantInvoices?: Stripe.Invoice[]
  isStripeTest?: boolean
}
export default function TenantsTable({ items, pagination, tenantInvoices, isStripeTest }: Props) {
  const { t } = useTranslation()

  function getTenantInvoices(tenant: TenantWithDetailsDto) {
    const items =
      tenantInvoices?.filter(
        (f) => f.customer?.toString() === tenant.subscription?.stripe_customer_id,
      ) ?? []
    const sortedByCreatedDesc = items.sort((a, b) => (a.created > b.created ? 1 : -1))
    return sortedByCreatedDesc
  }
  function lastTenantInvoice(tenant: TenantWithDetailsDto): Stripe.Invoice | undefined {
    const items = getTenantInvoices(tenant)
    return items.length > 0 ? items[items.length - 1] : undefined
  }
  function getTotalPaid(tenant: TenantWithDetailsDto): number {
    const items = getTenantInvoices(tenant)
    return items.reduce((a, b) => a + Number(b.amount_paid / 100), 0)
  }

  return (
    <div className="space-y-2">
      <TableSimple
        items={items}
        headers={[
          {
            name: 'tenant',
            title: t('models.tenant.object'),
            value: (i) => (
              <div className="max-w-sm truncate">
                <div className="flex items-center space-x-1 truncate font-medium text-gray-800">
                  <Link href={`/admin/accounts/${i.id}`} className="hover:underline">
                    {i.name}
                  </Link>
                </div>

                <Link
                  href={'/app/' + i.slug}
                  className="rounded-md border-b border-dashed text-xs text-gray-500 hover:border-dashed hover:border-gray-400 focus:bg-gray-100"
                >
                  <span>/{i.slug}</span>
                </Link>
              </div>
            ),
          },
          {
            name: 'subscription',
            title: t('admin.tenants.subscription.title'),
            // value: (i) => "",
            value: (item) => (
              <span>
                {item.subscription?.products ? (
                  <>
                    <div>
                      {item.subscription.products.map((product) => {
                        return (
                          <div key={product.id}>
                            <div>
                              {t(product.subscription_product.title)}{' '}
                              {product.prices
                                .map(
                                  (f) =>
                                    `$${NumberUtils.decimalFormat(Number(f.subscription_price?.price ?? 0))} - ${SubscriptionUtils.getBillingPeriodDescription(
                                      t,
                                      f.subscription_price?.billing_period ?? 0,
                                    )}`,
                                )
                                .join(', ')}
                            </div>
                            {product.ends_at && (
                              <>
                                {new Date() < new Date(product.ends_at) ? (
                                  <div className="text-red-500">
                                    {t('settings.subscription.ends')}{' '}
                                    {DateUtils.dateMonthDayYear(product.ends_at)}
                                  </div>
                                ) : (
                                  <div className="text-red-500">
                                    {t('settings.subscription.endedAt')}{' '}
                                    {DateUtils.dateMonthDayYear(product.ends_at)}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <span className="text-sm italic text-gray-400">
                    {t('settings.subscription.noSubscription')}
                  </span>
                )}
              </span>
            ),
          },
          {
            name: 'lastInvoice',
            title: 'Last invoice',
            hidden: tenantInvoices === undefined,
            value: (i) => (
              <a
                className="flex flex-col space-y-1 hover:underline"
                target="_blank"
                rel="noreferrer"
                href={`https://dashboard.stripe.com${isStripeTest ? '/test' : ''}/customers/${i.subscription?.stripe_customer_id ?? ''}`}
              >
                <div className="flex flex-col space-y-1">
                  {!lastTenantInvoice(i) ? (
                    <span>-</span>
                  ) : (
                    <TenantInvoice item={lastTenantInvoice(i)!} />
                  )}
                </div>
              </a>
            ),
          },
          {
            name: 'totalInvoicesPaid',
            title: 'Total paid',
            hidden: tenantInvoices === undefined,
            value: (i) => (
              <a
                className="flex flex-col space-y-1 hover:underline"
                target="_blank"
                rel="noreferrer"
                href={`https://dashboard.stripe.com${isStripeTest ? '/test' : ''}/customers/${i.subscription?.stripe_customer_id ?? ''}`}
              >
                {getTotalPaid(i) === 0 ? (
                  <span>-</span>
                ) : (
                  <div>
                    ${NumberUtils.decimalFormat(getTotalPaid(i))} (
                    {getTenantInvoices(i).filter((f) => f.status === 'paid').length})
                  </div>
                )}
              </a>
            ),
          },
          {
            name: 'users',
            title: t('models.user.plural'),
            className: 'max-w-xs truncate',
            value: (i) => i.users.map((f) => f.user.email).join(', '),
            href: (i) => `/admin/accounts/users?tenantId=${i.id}`,
          },
          {
            name: 'createdAt',
            title: t('shared.createdAt'),
            // value: (i) => i.createdAt,
            value: (item) => (
              <div className="flex flex-col">
                <div>{DateUtils.dateYMD(item.created_at)}</div>
                <div className="text-xs">{DateUtils.dateAgo(item.created_at)}</div>
              </div>
            ),
          },
        ]}
        actions={[
          {
            title: t('admin.tenants.overview'),
            onClickRoute: (_, item) => `/admin/accounts/${item.id}`,
          },
        ]}
        pagination={pagination}
      />
    </div>
  )
}

function TenantInvoice({ item }: { item: Stripe.Invoice }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col">
      <div
        title={DateUtils.dateYMD(new Date(item.created * 1000))}
        className="flex items-center space-x-1"
      >
        <div className="flex items-baseline space-x-1">
          <div>${NumberUtils.decimalFormat(item.total / 100)}</div>
          <div className="text-xs uppercase text-gray-500">{item.currency}</div>
        </div>
        <SimpleBadge
          title={t('app.subscription.invoices.status.' + item.status)}
          color={item.status === 'paid' ? Colors.GREEN : Colors.YELLOW}
        />
      </div>
      <div className="text-xs text-gray-400">
        {item.created ? DateUtils.dateAgo(new Date(item.created * 1000)) : ''}
      </div>
    </div>
  )
}
