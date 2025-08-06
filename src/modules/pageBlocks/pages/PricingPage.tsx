import { TFunction } from "i18next";
import { MetaTagsDto } from "@/lib/dtos/MetaTagsDto";
import { PageBlockDto } from "../blocks/PageBlockDto";
import { PricingBlockData } from "../blocks/marketing/pricing/PricingBlockDto";
import { defaultFooter } from "../defaultBlocks/defaultFooter";
import { defaultHeader } from "../defaultBlocks/defaultHeader";
import { defaultSiteTags, getMetaTags } from "../seo/SeoMetaTagsUtils";

export namespace PricingPage {
  export type LoaderData = {
    metatags: MetaTagsDto;
    pricingBlockData: PricingBlockData;
  };
  export function metatags({ t }: { t: TFunction }): MetaTagsDto {
    return getMetaTags({
      title: `${t("front.pricing.title")} | ${defaultSiteTags.title}`,
      description: `${t("front.pricing.headline")}`,
    });
  }
  export function blocks({ data, t }: { data: LoaderData; t: TFunction }): PageBlockDto[] {
    return [
      // Header
      { header: defaultHeader({ t }) },
      // Heading
      {
        heading: {
          style: "centered",
          headline: t("front.pricing.title"),
          subheadline: t("front.pricing.headline"),
        },
        layout: {
          padding: { y: "py-4" },
        },
      },
      // Pricing
      {
        pricing: {
          style: "simple",
          allowCoupons: true,
          contactUs: {
            title: "pricing.contactUs",
            description: "pricing.customPlanDescription",
            features: [t("pricing.features.users.moreThan", { 0: 12 }), t("pricing.features.prioritySupport.priority")],
          },
          data: data.pricingBlockData,
        },
      },
      // Footer
      {
        footer: defaultFooter({ t }),
      },
    ];
  }
}
