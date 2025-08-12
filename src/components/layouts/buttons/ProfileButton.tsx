'use client'

import { useTranslation } from 'react-i18next'
import { Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import clsx from 'clsx'
import UserUtils from '@/modules/accounts/utils/UserUtils'
import UrlUtils from '@/lib/utils/UrlUtils'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import useRootData from '@/lib/state/useRootData'

interface Props {
  layout?: '/' | 'app' | 'admin'
  items?: { title: string; path: string; hidden?: boolean; onClick?: () => void }[]
}

export default function ProfileButton({ layout, items }: Props) {
  const { user } = useRootData()
  const params = useParams()
  const { t } = useTranslation()

  const [opened, setOpened] = useState(false)

  function closeDropdownUser() {
    setOpened(false)
  }

  return (
    <div className="relative flex-shrink-0">
      <div className="inline-flex divide-x divide-gray-300 rounded-sm shadow-none">
        <button
          onClick={() => setOpened(!opened)}
          className={clsx(
            'relative inline-flex items-center rounded-full border border-border bg-background font-medium text-muted-foreground shadow-inner hover:bg-secondary focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2',
            !user?.avatar && 'p-2',
            user?.avatar && 'p-1',
          )}
          id="user-menu"
          aria-label="User menu"
          aria-haspopup="true"
        >
          {(() => {
            if (user?.avatar) {
              return (
                <Image
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800"
                  src={user.avatar}
                  alt="Avatar"
                />
              )
            } else {
              return (
                <span className="inline-block h-5 w-5 overflow-hidden rounded-full">
                  <svg className="h-full w-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
              )
            }
          })()}
        </button>
      </div>

      <Transition
        as={Fragment}
        show={opened}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute right-0 z-40 mt-2 w-64 origin-top-right divide-y divide-border overflow-hidden rounded-sm border border-border shadow-lg focus:outline-none">
          <div
            className="shadow-xs rounded-sm bg-background py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu"
          >
            <div
              className="group flex items-center truncate px-4 py-2 text-sm text-muted-foreground transition duration-150 ease-in-out"
              role="menuitem"
            >
              <div className="flex flex-col space-y-1 truncate">
                <div className="font-medium">{UserUtils.profileName(user)}</div>
                <div className="truncate font-bold">{user?.email}</div>
              </div>
            </div>
            <div className="border-t border-border"></div>

            {layout === 'app' ? (
              <>
                <Link
                  className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  href={!params.tenant ? '' : UrlUtils.currentTenantUrl(params, `settings/profile`)}
                >
                  {t('app.navbar.profile')}
                </Link>

                <Link
                  className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  href={!params.tenant ? '' : UrlUtils.currentTenantUrl(params, 'settings/members')}
                >
                  {t('app.navbar.members')}
                </Link>

                <Link
                  className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  href={
                    !params.tenant ? '' : UrlUtils.currentTenantUrl(params, `settings/subscription`)
                  }
                >
                  {t('app.navbar.subscription')}
                </Link>

                <Link
                  className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  href={!params.tenant ? '' : UrlUtils.currentTenantUrl(params, 'settings/account')}
                >
                  {t('app.navbar.tenant')}
                </Link>

                <div className="mt-1 border-t border-border"></div>

                <Link
                  className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                  role="menuitem"
                  href={'/new-account'}
                >
                  {t('app.tenants.create.title')}
                </Link>
              </>
            ) : layout === 'admin' ? (
              <Link
                className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                role="menuitem"
                onClick={closeDropdownUser}
                href={!user ? '' : `/admin/settings/profile`}
              >
                {t('app.navbar.profile')}
              </Link>
            ) : layout === '/' ? (
              <Fragment>
                {user?.admin && (
                  <Link
                    className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    href="/admin"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  href={`/settings`}
                >
                  {t('app.navbar.profile')}
                </Link>
                <Link
                  className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  href={`/settings/subscription`}
                >
                  {t('app.navbar.subscription')}
                </Link>
              </Fragment>
            ) : items ? (
              items.map((item) => (
                <Link
                  key={item.path}
                  className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                  role="menuitem"
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick()
                    }
                    closeDropdownUser()
                  }}
                  href={item.path}
                >
                  {item.title}
                </Link>
              ))
            ) : null}

            {!items && (
              <a
                href="/logout"
                className="block w-full px-4 py-2 text-left text-sm transition duration-150 ease-in-out hover:bg-secondary focus:outline-none"
                role="menuitem"
              >
                {t('app.navbar.signOut')}
              </a>
            )}
          </div>
        </div>
      </Transition>
    </div>
  )
}
