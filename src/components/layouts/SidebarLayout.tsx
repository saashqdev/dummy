'use client'

import { Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useRef, useState } from 'react'
import SidebarMenu from './SidebarMenu'
import ProfileButton from './buttons/ProfileButton'
import CurrentSubscriptionButton from './buttons/CurrentSubscriptionButton'
import TenantSelect from './selectors/TenantSelect'
import Link from 'next/link'
import useRootData from '@/lib/state/useRootData'
import clsx from 'clsx'
import ThemeSelector from '../ui/selectors/ThemeSelector'
import { AppDataDto } from '@/lib/state/useAppData'
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface Props {
  layout: 'app' | 'admin'
  children: ReactNode
  appData?: AppDataDto
}

export default function SidebarLayout({ layout, children, appData }: Props) {
  const { appConfiguration } = useRootData()
  const params = useParams()
  // const title = "TODO: getTitle";
  const title = ''

  const mainElement = useRef<HTMLElement>(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    try {
      // @ts-ignore
      $crisp?.push(['do', 'chat:hide'])
    } catch (e) {
      // ignore
    }
  }, [])

  function getLogoDarkMode() {
    if (appConfiguration.branding.logo_dark_mode?.length) {
      return appConfiguration.branding.logo_dark_mode
    }
    if (appConfiguration.branding.logo?.length) {
      return appConfiguration.branding.logo
    }
    return '/assets/img/logo-dark.png'
  }
  return (
    <div
      className={clsx('flex h-screen overflow-hidden bg-gray-100 text-gray-800')}
      style={{
        colorScheme: 'light',
      }}
    >
      {/*Mobile sidebar */}
      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <Transition
              as={Fragment}
              show={sidebarOpen}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-gray-800 opacity-75" />
              </div>
            </Transition>

            <Transition
              as={Fragment}
              show={sidebarOpen}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-900">
                <div className="absolute right-0 top-0 -mr-14 mt-2 p-1">
                  <button
                    className="flex h-12 w-12 items-center justify-center rounded-sm focus:bg-gray-600 focus:outline-none"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <svg
                      className="h-7 w-7 text-white"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-5 h-0 flex-1 overflow-y-auto">
                  <nav className="space-y-3 px-2">
                    <div className="flex flex-col space-y-2">
                      <Link href={'/'}>
                        {appConfiguration.branding.logo_dark_mode ||
                        appConfiguration.branding.logo ? (
                          <img
                            className={'mx-auto h-8 w-auto'}
                            src={
                              appConfiguration.branding.logo_dark_mode ||
                              appConfiguration.branding.logo
                            }
                            alt="Logo"
                          />
                        ) : (
                          <Image
                            className={'mx-auto h-8 w-auto'}
                            src={'/assets/img/logo-dark.png'}
                            alt="Logo"
                          />
                        )}
                      </Link>
                    </div>
                    <SidebarMenu
                      appData={appData}
                      layout={layout}
                      onSelected={() => setSidebarOpen(!sidebarOpen)}
                    />
                  </nav>
                </div>
                {layout == 'app' && appData && (
                  <TenantSelect currentTenant={appData.currentTenant} />
                )}
              </div>
            </Transition>
            <div className="w-14 flex-shrink-0">
              {/*Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        )}
      </div>

      {/*Desktop sidebar */}
      <div
        className={
          sidebarOpen
            ? 'hidden transition duration-1000 ease-in'
            : 'border-theme-200 dark:border-theme-800 hidden overflow-x-hidden border-r shadow-sm dark:border-r-0 dark:shadow-lg md:flex md:flex-shrink-0'
        }
      >
        <div className="flex w-64 flex-col">
          <div className="bg-theme-600 flex h-0 flex-1 flex-col shadow-md">
            <div className="flex flex-1 flex-col overflow-y-auto">
              <nav className="flex-1 select-none space-y-3 bg-gray-900 px-2 py-4">
                <div className="flex flex-col space-y-2">
                  <Link href={'/'}>
                    {appConfiguration.branding.logo_dark_mode || appConfiguration.branding.logo ? (
                      <img
                        className={'mx-auto h-8 w-auto'}
                        src={
                          appConfiguration.branding.logo_dark_mode || appConfiguration.branding.logo
                        }
                        alt="Logo"
                      />
                    ) : (
                      <Image
                        className={'mx-auto h-8 w-auto'}
                        src={'/assets/img/logo-dark.png'}
                        alt="Logo"
                      />
                    )}
                  </Link>
                </div>
                <SidebarMenu appData={appData} layout={layout} />
              </nav>
            </div>
          </div>

          {layout == 'app' && appData && <TenantSelect currentTenant={appData.currentTenant} />}
        </div>
      </div>

      {/*Content */}
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <div className="relative flex h-14 flex-shrink-0 border-b border-gray-200 bg-white shadow-inner">
          <button
            className="border-r border-gray-200 px-4 text-gray-600 focus:bg-gray-100 focus:text-gray-600 focus:outline-none"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>

          <NavBar layout={layout} title={title} appData={appData} />
        </div>

        <main
          ref={mainElement}
          className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none"
          tabIndex={0}
        >
          <div key={params.tenant?.toString()} className="pb-20 sm:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function NavBar({
  layout,
  title,
  appData,
}: {
  layout: 'app' | 'admin'
  title?: string
  appData?: AppDataDto
}) {
  return (
    <div className="flex flex-1 justify-between space-x-2 px-3">
      <div className="flex flex-1 items-center">
        <div className="font-extrabold">{title}</div>
      </div>
      <div className="flex items-center space-x-2 md:ml-6">
        {appData?.mySubscription && (
          <CurrentSubscriptionButton mySubscription={appData.mySubscription} />
        )}
        {layout === 'admin' && <ThemeSelector variant="secondary" />}
        <ProfileButton layout={layout} />
      </div>
    </div>
  )
}
