"use client";

import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { HeroBlockDto } from "./HeroBlockDto";
import ButtonEvent from "@/components/ui/buttons/ButtonEvent";
import ProductHuntBadge from "../launch/ProductHuntBadge";

export default function HeroVariantSimple({ item }: { item: HeroBlockDto }) {
  const { t } = useTranslation();
  return (
    <section>
      <div className="mx-auto flex max-w-screen-xl px-4 py-16 lg:items-center">
        <div className="mx-auto max-w-7xl text-center md:max-w-6xl">
          <div className="mb-4">
            <ProductHuntBadge />
            {item.topText && (
              <span className="block text-sm font-semibold uppercase tracking-wide sm:text-base lg:text-sm xl:text-base">
                {t(item.topText.text ?? "")}{" "}
                {item.topText.link && (
                  <ButtonEvent
                    to={item.topText.link.href ?? ""}
                    className="relative font-semibold text-primary"
                    event={{
                      action: "click",
                      category: "hero",
                      label: item.topText.link.text ?? "",
                      value: item.topText.link.href ?? "",
                    }}
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    {t(item.topText.link.text ?? "")} <span aria-hidden="true">&rarr;</span>
                  </ButtonEvent>
                )}
              </span>
            )}
          </div>
          {item.heading && <h1 className="title-font mb-4 max-w-5xl text-4xl font-bold sm:text-5xl md:text-6xl md:font-black">{t(item.heading)}</h1>}
          {item.subheading && <h2 className="mb-8 max-w-5xl text-lg leading-relaxed md:text-xl">{t(item.subheading)}</h2>}

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {item.cta.map((item, idx) => {
              return (
                <ButtonEvent
                  key={idx}
                  to={item.href}
                  target={item.target}
                  className={clsx(
                    "w-full sm:w-auto",
                    item.isPrimary
                      ? "inline-flex justify-center rounded-md border-0 bg-primary px-4 py-3 text-lg text-primary-foreground shadow-sm hover:bg-primary/95 focus:outline-none"
                      : "inline-flex justify-center rounded-md border-0 bg-secondary px-4 py-3 text-lg text-secondary-foreground shadow-sm hover:bg-secondary/95 focus:outline-none"
                  )}
                  event={{ action: "click", category: "hero", label: item.text ?? "", value: item.href ?? "" }}
                >
                  {t(item.text)}
                </ButtonEvent>
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
      </div>
    </section>
  );
}
