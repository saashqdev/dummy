import { MetaTagsDto } from "@/lib/dtos/MetaTagsDto";

type SiteTags = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  thumbnail?: string;
  twitterCreator?: string;
  twitterSite?: string;
};
export const defaultSiteTags: SiteTags = {
  title: "Next.js RockStack Demo",
  description: "Build, launch, fail, repeat with Next.js, Remix, SvelteKit, Tailwind CSS, shadcn/ui, Prisma, Drizzle, Stripe, Postmark. and Resend.",
  keywords: "remix,nextjs,svelte,saas,tailwindcss,prisma,react,typescript,boilerplate,saas-kit,saas-boilerplate,saas-starter-kit,stripe,postmark,drizzle",
  image: "https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1727286645348-rockstack-og.png",
  thumbnail: "https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1727460068835-rockstack-thumbnail.jpg.jpeg",
  twitterCreator: "@AlexandroMtzG",
  twitterSite: "",
};

export function getMetaTags(tags?: SiteTags): MetaTagsDto {
  return parseMetaTags({
    ...defaultSiteTags,
    ...tags,
    // ...getLinkTags(),
  });
}

function parseMetaTags(tags: SiteTags): MetaTagsDto {
  return {
    title: tags.title,
    description: tags.description,
    keywords: tags.keywords,
    openGraph: {
      title: tags.title,
      type: "website",
      images: tags.image ? [{ url: tags.image }] : [],
      description: tags.description,
    },
  };
  // return [
  //   { title: tags.title },
  //   { name: "description", content: tags.description },
  //   { name: "keywords", content: tags.keywords },
  //   { property: "og:title", content: tags.title },
  //   { property: "og:type", content: "website" },
  //   { property: "og:image", content: tags.image },
  //   { property: "og:card", content: "summary_large_image" },
  //   { property: "og:description", content: tags.description },
  //   { property: "twitter:image", content: tags.thumbnail },
  //   { property: "twitter:card", content: "summary_large_image" },
  //   { property: "twitter:creator", content: tags.twitterCreator ?? "" },
  //   { property: "og:creator", content: tags.twitterCreator },
  //   { property: "twitter:site", content: tags.twitterSite ?? "" },
  //   { property: "twitter:title", content: tags.title },
  //   { property: "twitter:description", content: tags.description },
  // ];
}

// function getLinkTags(): MetaTagsDto {
//   return {};
//   // const baseUrl = (await getBaseURL());
//   // const urlObj = new URL(request.url);
//   // const pathname = `${baseUrl}${urlObj.pathname}`;
//   // const searchParams = urlObj.searchParams;
//   // const lng = searchParams.get("lng") ?? fallbackLng;
//   // const linkTags: MetaTagsDto = {};

//   // // Set the canonical link
//   // const canonicalHref = lng === fallbackLng ? pathname : `${pathname}?lng=${lng}`;
//   // linkTags.push({ property: "og:locale", content: lng });
//   // linkTags.push({ tagName: "link", rel: "canonical", href: canonicalHref });
//   // linkTags.push({ property: "og:url", content: canonicalHref });

//   // // Add hreflang tags for each supported language
//   // i18nConfig.supportedLngs.forEach((supportedLng) => {
//   //   const href = supportedLng === i18nConfig.fallbackLng ? pathname : `${pathname}?lng=${supportedLng}`;
//   //   linkTags.push({ tagName: "link", rel: "alternate", href: href, hrefLang: supportedLng });
//   // });
//   // linkTags.push({ tagName: "link", rel: "alternate", href: pathname, hrefLang: "x-default" });

//   // return linkTags;
// }
