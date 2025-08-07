import { getServerTranslations } from "@/i18n/server";
import PageBlocks from "@/modules/pageBlocks/blocks/PageBlocks";
import { NewsletterPage } from "@/modules/pageBlocks/pages/NewsletterPage";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return await NewsletterPage.metatags({ t });
}

export default async function Contact() {
  const { t } = await getServerTranslations();
  return <PageBlocks items={NewsletterPage.blocks({ t })} />;
}
