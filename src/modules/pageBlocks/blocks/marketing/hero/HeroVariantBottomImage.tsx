'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { HeroBlockDto } from '@/modules/pageBlocks/blocks/marketing/hero/HeroBlockDto'
import ProductHuntBadge from '../launch/ProductHuntBadge'
import ButtonEvent from '@/components/ui/buttons/ButtonEvent'
import Image from 'next/image'

export default function HeroVariantBottomImage({ item }: { item: HeroBlockDto }) {
  const { t } = useTranslation()
  return (
    <section className="body-font">
      <div className="container mx-auto flex flex-col items-center justify-center px-5 py-16">
        <div className="flex w-full flex-col items-center text-center">
          <div className="mb-4">
            <ProductHuntBadge />
            {item.topText && (
              <span className="block text-sm font-semibold uppercase tracking-wide text-gray-500 sm:text-base lg:text-sm xl:text-base">
                {t(item.topText.text ?? '')}{' '}
                {item.topText.link && (
                  <Link
                    href={item.topText.link.href ?? ''}
                    className="relative font-semibold text-primary"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    {t(item.topText.link.text ?? '')} <span aria-hidden="true">&rarr;</span>
                  </Link>
                )}
              </span>
            )}
          </div>
          {item.heading && (
            <h1 className="title-font mb-4 max-w-5xl text-4xl font-bold sm:text-5xl md:text-6xl md:font-black">
              {t(item.heading)}
            </h1>
          )}
          {item.subheading && (
            <h2 className="mb-8 max-w-5xl text-lg leading-relaxed md:text-xl">
              {t(item.subheading)}
            </h2>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            {item.cta.map((item, idx) => {
              return (
                <Fragment key={idx}>
                  <ButtonEvent
                    key={idx}
                    event={{
                      action: 'click',
                      category: 'hero',
                      label: item.text ?? '',
                      value: item.href ?? '',
                    }}
                    to={item.href}
                    className={clsx(
                      'w-full sm:w-auto',
                      item.isPrimary
                        ? 'inline-flex justify-center rounded-md border-0 bg-primary px-4 py-3 text-lg text-primary-foreground shadow-sm hover:bg-primary/95 focus:outline-none'
                        : 'inline-flex justify-center rounded-md border-0 bg-secondary px-4 py-3 text-lg text-secondary-foreground shadow-sm hover:bg-secondary/95 focus:outline-none',
                    )}
                  >
                    {t(item.text)}
                  </ButtonEvent>
                </Fragment>
              )
            })}
          </div>
          <div className="mt-8 space-y-3">
            {item.bottomText && (
              <span>
                {t(item.bottomText.text ?? '')}{' '}
                {item.bottomText.link?.href && (
                  <ButtonEvent
                    to={item.bottomText.link.href ?? ''}
                    target={item.bottomText.link.target}
                    className="text-sm hover:underline"
                    event={{
                      action: 'click',
                      category: 'hero',
                      label: item.bottomText.link.text ?? '',
                      value: item.bottomText.link.href ?? '',
                    }}
                  >
                    {t(item.bottomText.link.text ?? '')}
                  </ButtonEvent>
                )}
              </span>
            )}
          </div>
        </div>
        <Image
          className="mt-10 w-auto max-w-5xl rounded border-2 border-dashed border-gray-800 object-cover object-center"
          alt="hero"
          src={item.image ?? '/placeholder.png'}
        />
      </div>
    </section>
  )
}
