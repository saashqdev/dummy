"use client";

import Link from "next/link";
import clsx from "clsx";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { HeroBlockDto } from "@/modules/pageBlocks/blocks/marketing/hero/HeroBlockDto";
import ProductHuntBadge from "../launch/ProductHuntBadge";
import ButtonEvent from "@/components/ui/buttons/ButtonEvent";

export default function HeroVariantRightImage({ item }: { item: HeroBlockDto }) {
  const { t } = useTranslation();
  return (
    <section className="body-font">
      <div className="container mx-auto flex flex-col items-center px-5 py-24 md:flex-row">
        <div className="mb-16 flex flex-col items-center text-center md:mb-0 md:w-1/2 md:items-start md:pr-16 md:text-left lg:flex-grow lg:pr-24">
          <div className="mb-4">
            <ProductHuntBadge />
            {item.topText && (
              <span className="block text-sm font-semibold uppercase tracking-wide text-gray-500 sm:text-base lg:text-sm xl:text-base">
                {t(item.topText.text ?? "")}{" "}
                {item.topText.link && (
                  <Link href={item.topText.link.href ?? ""} className="relative font-semibold text-primary">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {t(item.topText.link.text ?? "")} <span aria-hidden="true">&rarr;</span>
                  </Link>
                )}
              </span>
            )}
          </div>
          <h1 className="title-font mb-4 text-3xl font-bold sm:text-4xl md:text-5xl md:font-extrabold">{t(item.heading)}</h1>
          <h2 className="mb-8 leading-relaxed text-muted-foreground">{t(item.subheading)}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {item.cta.map((item, idx) => {
              return (
                <Fragment key={idx}>
                  <ButtonEvent
                    key={idx}
                    event={{ action: "click", category: "hero", label: item.text ?? "", value: item.href ?? "" }}
                    to={item.href}
                    className={clsx(
                      "w-full sm:w-auto",
                      item.isPrimary
                        ? "inline-flex justify-center rounded-md border-0 bg-primary px-4 py-3 text-lg text-primary-foreground shadow-sm hover:bg-primary/95 focus:outline-none"
                        : "inline-flex justify-center rounded-md border-0 bg-secondary px-4 py-3 text-lg text-secondary-foreground shadow-sm hover:bg-secondary/95 focus:outline-none"
                    )}
                  >
                    {t(item.text)}
                  </ButtonEvent>
                </Fragment>
              );
            })}
          </div>
          <div className="mt-8 space-y-3">
            {item.bottomText && (
              <span>
                {t(item.bottomText.text ?? "")}{" "}
                {item.bottomText.link?.href && (
                  <ButtonEvent
                    to={item.bottomText.link.href ?? ""}
                    target={item.bottomText.link.target}
                    className="text-sm hover:underline"
                    event={{ action: "click", category: "hero", label: item.bottomText.link.text ?? "", value: item.bottomText.link.href ?? "" }}
                  >
                    {t(item.bottomText.link.text ?? "")}
                  </ButtonEvent>
                )}
              </span>
            )}
          </div>
        </div>
        <div className="dark:border-border-300 w-5/6 rounded-lg border-2 border-dashed border-gray-800 md:w-1/2 lg:w-full lg:max-w-lg">
          <img className="objeco h-96 rounded object-cover object-center" alt="hero" src={item.image ?? "https://dummyimage.com/720x600"} />
        </div>
      </div>
    </section>
  );
}
