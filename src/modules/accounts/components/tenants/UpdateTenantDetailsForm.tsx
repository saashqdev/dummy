'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ButtonTertiary from '@/components/ui/buttons/ButtonTertiary'
import UploadFile from '@/components/ui/uploaders/UploadFile'
import UrlUtils from '@/lib/utils/UrlUtils'
import { TenantDto } from '@/db/models'
import LoadingButton from '@/components/ui/buttons/LoadingButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IServerAction } from '@/lib/dtos/ServerComponentsProps'
import Image from 'next/image'

interface Props {
  tenant: TenantDto
  disabled: boolean
  canCreateNew?: boolean
  serverAction: IServerAction
}

export default function UpdateTenantDetailsForm({
  tenant,
  disabled,
  canCreateNew,
  serverAction,
}: Props) {
  const { t } = useTranslation()

  const [slug, setSlug] = useState<string | undefined>(tenant?.slug ?? '')
  const [icon, setIcon] = useState<string | undefined>(tenant?.icon ?? '')

  function loadedImage(image: string | undefined) {
    setIcon(image)
  }
  return (
    <form action={serverAction.action}>
      <input type="hidden" name="action" value="edit" hidden readOnly />
      <input type="hidden" name="id" value={tenant.id} hidden readOnly />
      <div className="p-1">
        <div className="">
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-6 sm:col-span-6">
              <div>
                <label htmlFor="name" className="mb-1 text-xs font-medium">
                  {t('shared.name')} <span className="text-red-500">*</span>
                </label>
                <Input
                  autoFocus
                  disabled={disabled}
                  required
                  name="name"
                  title={t('shared.name')}
                  defaultValue={tenant?.name}
                />
              </div>
            </div>
            <div className="col-span-6 sm:col-span-6">
              <div>
                <label htmlFor="slug" className="mb-1 text-xs font-medium">
                  {t('shared.slug')} <span className="text-red-500">*</span>
                </label>
                <Input
                  disabled={disabled}
                  required
                  name="slug"
                  title={t('shared.slug')}
                  value={slug}
                  onChange={(e) => {
                    const slug = UrlUtils.slugify(e.currentTarget.value.toString())
                    if (slug) {
                      setSlug(slug)
                    }
                  }}
                />
              </div>
            </div>

            <div className="col-span-6 sm:col-span-6">
              <label htmlFor="icon" className="block text-xs font-medium leading-5 text-gray-700">
                {t('shared.icon')}
              </label>
              <div className="mt-2 flex items-center space-x-3">
                <input id="icon" name="icon" value={icon} hidden readOnly />
                <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                  {(() => {
                    if (icon) {
                      return <Image id="icon" alt="Tenant icon" src={icon} />
                    } else {
                      return (
                        <svg
                          id="icon"
                          className="h-full w-full text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )
                    }
                  })()}
                </div>

                {icon ? (
                  <ButtonTertiary
                    disabled={disabled}
                    destructive={true}
                    onClick={() => loadedImage('')}
                    type="button"
                  >
                    {t('shared.delete')}
                  </ButtonTertiary>
                ) : (
                  <UploadFile
                    disabled={disabled}
                    accept="image/png, image/jpg, image/jpeg"
                    onDropped={loadedImage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 border-t border-border pt-3">
          <div className="flex justify-between">
            <div>
              {canCreateNew && (
                <Button variant="outline" asChild>
                  <Link href="/new-account">{t('app.tenants.create.title')}</Link>
                </Button>
              )}
            </div>
            <LoadingButton isLoading={serverAction.pending} disabled={disabled} type="submit">
              {t('shared.save')}
            </LoadingButton>
          </div>
        </div>
      </div>
    </form>
  )
}
