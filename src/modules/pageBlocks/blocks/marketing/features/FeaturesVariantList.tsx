"use client";

import { useTranslation } from "react-i18next";
import { FeaturesBlockDto } from "@/modules/pageBlocks/blocks/marketing/features/FeaturesBlockDto";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import { Fragment } from "react";
import GridBlockUtils from "../../shared/grid/GridBlockUtils";
import RightArrowIcon from "@/components/ui/icons/RightArrowIcon";
import clsx from "clsx";
import ButtonEvent from "@/components/ui/buttons/ButtonEvent";
import { ExternalLinkIcon } from "lucide-react";
import SvgOrImg from "@/components/ui/icons/SvgOrImg";

export default function FeaturesList({ item }: { item: FeaturesBlockDto }) {
  const { t } = useTranslation();
  return (
    <section id="features" className="body-font">
      <div className="container mx-auto space-y-8 px-5 py-24 sm:space-y-12">
        <div
          className={clsx(
            "space-y-5",
            (!item.position || item.position === "center") && "text-center sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl",
            item.position === "left" && "text-left",
            item.position === "right" && "text-right"
          )}
        >
          <div className="space-y-1">
            {item.topText && <div className="text-sm font-semibold uppercase leading-8 text-muted-foreground">{t(item.topText)}</div>}
            {item.title && <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.title)}</h1>}
            {item.headline && <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>}
          </div>
          {item.subheadline && (
            <Fragment>
              {item.title ? (
                <h2 className="mx-auto text-xl text-muted-foreground">{t(item.subheadline)}</h2>
              ) : (
                <p className="mx-auto text-xl text-muted-foreground">{t(item.subheadline)}</p>
              )}
            </Fragment>
          )}

          <div
            className={clsx(
              "mt-8 flex flex-wrap gap-4",
              item.position === "left" && "justify-start",
              (!item.position || item.position === "center") && "justify-center",
              item.position === "right" && "justify-end"
            )}
          >
            {item.cta?.map((item, idx) => {
              return (
                <ButtonEvent
                  key={idx}
                  to={item.href}
                  target={item.target}
                  className={clsx(
                    "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-8 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    item.isPrimary
                      ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                      : "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                  )}
                  event={{ action: "click", category: "features", label: item.text ?? "", value: item.href ?? "" }}
                >
                  {t(item.text)} {item.icon === "external" && <ExternalLinkIcon className="h-4" />}
                </ButtonEvent>
              );
            })}
          </div>
        </div>

        <div className={clsx(GridBlockUtils.getClasses(item.grid), "mx-auto")}>
          {item.items.map((feature, idx) => {
            return (
              <div key={idx} className="flex">
                <div className="mb-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-primary">
                  {feature.icon ? (
                    <>
                      <SvgOrImg icon={feature.icon} className="h-5 w-5" title={feature.name} />
                    </>
                  ) : (
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-grow pl-6">
                  <p className="title-font mb-2 text-lg font-medium">{t(feature.name)}</p>
                  <p className="text-base leading-relaxed text-muted-foreground">{t(feature.description)}</p>
                  {feature.link?.href && (
                    <ButtonEvent
                      to={feature.link?.href}
                      target={feature.link.target}
                      className="mt-3 inline-flex items-center text-muted-foreground hover:underline"
                      event={{ action: "click", category: "features", label: t(feature.name), value: feature.link.href }}
                    >
                      {feature.link.text ? t(feature.link.text) : t("shared.learnMore")}
                      <RightArrowIcon className="ml-1 h-4 w-4" />
                    </ButtonEvent>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
