import "@/styles/globals.css";
import "@/styles/themes.css";
import { detectLanguage, getServerTranslations } from "@/i18n/server";
import { I18nProvider } from "@/i18n/i18n-context";
import { getUserInfo } from "@/lib/services/session.server";
import { Metadata } from "next";
import { getRootData } from "@/lib/services/rootData.server";
import RootDataLayout from "@/context/RootDataLayout";
import { defaultSiteTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: defaultSiteTags.title,
    icons: [
      { url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lng = await detectLanguage();
  const userInfo = await getUserInfo();
  const scheme = userInfo?.scheme || "light";
  const rootData = await getRootData();

  return (
    <I18nProvider language={lng}>
      <RootDataLayout rootData={rootData} lng={lng} scheme={scheme}>
        {children}
      </RootDataLayout>
    </I18nProvider>
  );
}
