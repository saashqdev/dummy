import { getBaseURL } from "@/lib/services/url.server";
import { defaultAppConfiguration } from "@/modules/core/data/defaultAppConfiguration";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getBaseURL();
  const links = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/newsletter`, lastModified: new Date() },
    { url: `${baseUrl}/pricing`, lastModified: new Date() },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: new Date() },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date() },
    { url: `${baseUrl}/rockstack-vs-saasrock`, lastModified: new Date() },
    { url: `${baseUrl}/brand`, lastModified: new Date() },
  ];
  if (defaultAppConfiguration.affiliates?.provider.rewardfulApiKey) {
    links.push({ url: `${baseUrl}/affiliate-program`, lastModified: new Date() });
  }
  return links;
}
