import { getServerTranslations } from "@/i18n/server";
import PageBlocks from "@/modules/pageBlocks/blocks/PageBlocks";
import { ContactPage } from "@/modules/pageBlocks/pages/ContactPage";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return await ContactPage.metatags({ t });
}

export default async function Contact() {
  const { t } = await getServerTranslations();
  const data = await ContactPage.load();
  return <PageBlocks items={ContactPage.blocks({ t, data })} />;
}
