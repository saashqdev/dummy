'use client'

import { useTranslation } from 'react-i18next'
import { AppIndexLoaderData } from './page'
import Logo from '@/components/brand/Logo'
import EmptyState from '@/components/ui/emptyState/EmptyState'
import TenantUtils from '@/modules/accounts/utils/TenantUtils'
import { Combobox } from '@headlessui/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

export default function ({ data }: { data: AppIndexLoaderData }) {
  const { t } = useTranslation()

  return (
    <div>
      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
          <div className="flex flex-shrink-0 justify-center">
            <Logo />
          </div>
          <div className="sm:align-center sm:flex sm:flex-col">
            <div className="relative mx-auto w-full max-w-xl overflow-hidden px-2 py-12 sm:py-6">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {t('app.tenants.select')}
                </h1>
                <p className="mt-4 text-lg leading-6 text-muted-foreground">
                  {data.myTenants.length === 1 ? (
                    <span>{t('app.tenants.youBelongToOne')}</span>
                  ) : (
                    <span>{t('app.tenants.youBelongToMany', { 0: data.myTenants.length })}</span>
                  )}
                </p>
              </div>
              <div className="mt-12">
                {data.myTenants.length === 0 && !data.user.admin ? (
                  <EmptyState
                    className="rounded-2xl border-border"
                    description={t('api.errors.noOrganizations')}
                  />
                ) : (
                  <Combobox
                    as="div"
                    className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 shadow-sm ring-1 ring-black ring-opacity-5 transition-all dark:border-gray-800"
                    onChange={() => {}}
                    autoFocus
                  >
                    <div className="max-h-64 scroll-py-3 overflow-y-auto p-3">
                      {data.user.admin && (
                        <AccountItem
                          href="/admin"
                          name="Admin"
                          prefix="AD"
                          icon={
                            <div className="min-w-0 rounded-md border border-border bg-background">
                              {/* <Icon size="h-10 w-10" fromConfig={false} /> */}
                              <Image
                                className={clsx('h-10', 'hidden w-auto dark:block')}
                                src={'/assets/img/icon-dark.png'}
                                alt="Logo"
                              />
                              <Image
                                className={clsx('h-10', 'w-auto dark:hidden')}
                                src={'/assets/img/icon-light.png'}
                                alt="Logo"
                              />
                            </div>
                          }
                        />
                      )}
                      {data.myTenants.map((item) => (
                        <AccountItem
                          key={item.id}
                          href={`/app/${item.slug}/dashboard`}
                          name={item.name}
                          icon={
                            !item.icon ? null : (
                              <div className="rounded-md border border-gray-200">
                                <Image
                                  src={item.icon}
                                  className="h-10 w-10 rounded-lg"
                                  alt={item.name}
                                />
                              </div>
                            )
                          }
                          prefix={TenantUtils.prefix(item)}
                        />
                      ))}
                    </div>
                  </Combobox>
                )}
                <div className="mt-4 flex pb-12">
                  <Link
                    href="/new-account"
                    className="w-full text-center text-sm font-medium text-primary hover:text-primary/90 hover:underline"
                  >
                    {t('app.tenants.create.title')} <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountItem({
  href,
  name,
  icon,
  prefix,
}: {
  href: string
  name: string
  icon?: React.ReactNode | null
  prefix?: string | null
}) {
  return (
    <Combobox.Option value={href}>
      {({ active }) => (
        <>
          <Link
            href={href}
            className={clsx(
              'flex cursor-pointer select-none rounded-xl border border-transparent p-3 hover:border-border hover:bg-secondary hover:text-secondary-foreground',
              active && '',
            )}
          >
            {icon ? (
              icon
            ) : (
              <div
                className={clsx(
                  'flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary',
                )}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center">
                  <span
                    className={clsx('text-sm font-medium leading-none text-primary-foreground')}
                  >
                    {prefix}
                  </span>
                </span>
              </div>
            )}
            <div className="ml-4 flex-auto">
              <p className={clsx('text-sm font-medium', active ? '' : 'text-muted-foreground')}>
                {name}
              </p>
              <p className={clsx('text-sm', active ? '' : 'text-muted-foreground')}>{href}</p>
            </div>
          </Link>
        </>
      )}
    </Combobox.Option>
  )
}
