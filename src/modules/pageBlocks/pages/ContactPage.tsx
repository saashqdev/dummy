import { TFunction } from "i18next";
import { ContactFormBlockData } from "../blocks/marketing/contact/ContactFormBlockDto";
import { PageBlockDto } from "../blocks/PageBlockDto";
import { defaultHeader } from "../defaultBlocks/defaultHeader";
import { defaultFooter } from "../defaultBlocks/defaultFooter";
import { defaultSiteTags } from "../seo/SeoMetaTagsUtils";

export namespace ContactPage {
  export type LoaderData = {
    contactFormData: ContactFormBlockData;
  };
  export async function load(): Promise<LoaderData> {
    return {
      contactFormData: {
        actionUrl: process.env.CONTACT_FORM_URL,
      },
    };
  }
  export async function metatags({ t }: { t: TFunction }) {
    return {
      title: `${t("front.contact.title")} | ${defaultSiteTags.title}`,
      description: `${t("front.contact.headline")}`,
    };
  }
  export function blocks({ data, t }: { data: LoaderData; t: TFunction }): PageBlockDto[] {
    return [
      // Header
      { header: defaultHeader({ t }) },
      {
        heading: {
          headline: t("front.contact.title"),
          subheadline: t("front.contact.headline"),
        },
      },
      // Main
      {
        contact: {
          style: "simple",
          data: data.contactFormData,
        },
      },
      // Footer
      { footer: defaultFooter({ t }) },
    ];
  }
}
