import HeaderBlock from "@/modules/pageBlocks/blocks/marketing/header/HeaderBlock";
import FooterBlock from "@/modules/pageBlocks/blocks/marketing/footer/FooterBlock";
import PreviewIcon from "@/components/ui/logo-and-icon/PreviewIcon";
import HeadingBlock from "@/modules/pageBlocks/blocks/marketing/heading/HeadingBlock";
import { useTranslation } from "react-i18next";
import PreviewLogo from "@/components/ui/logo-and-icon/PreviewLogo";
import { getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";

export async function generateMetadata() {
  return getMetaTags({
    title: "Brand",
    description: "Brand description",
  });
}

export default async function () {
  const { t } = await getServerTranslations();
  return (
    <div>
      <div>
        <HeaderBlock />
        <HeadingBlock
          item={{
            style: "centered",
            headline: t("front.brand.title"),
            subheadline: t("front.brand.description"),
          }}
        />
        <div className="container mx-auto max-w-3xl space-y-6 bg-background py-8">
          <div className="space-y-2">
            <div className="font-black">{t("shared.icon")}</div>
            <PreviewIcon />
          </div>
          <div className="space-y-2">
            <div className="font-black">{t("shared.logo")}</div>
            <PreviewLogo />
          </div>
        </div>
        <FooterBlock />
      </div>
    </div>
  );
}
