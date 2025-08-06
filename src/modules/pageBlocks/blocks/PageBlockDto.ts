import { LayoutBlockDto } from "./shared/layout/LayoutBlockUtils";
import { BannerBlockDto } from "./marketing/banner/BannerBlockDto";
import { CommunityBlockDto } from "./marketing/community/CommunityBlockDto";
import { FaqBlockDto } from "./marketing/faq/FaqBlockDto";
import { FeaturesBlockDto } from "./marketing/features/FeaturesBlockDto";
import { FooterBlockDto } from "./marketing/footer/FooterBlockDto";
import { GalleryBlockDto } from "./marketing/gallery/GalleryBlockDto";
import { HeaderBlockDto } from "./marketing/header/HeaderBlockDto";
import { HeadingBlockDto } from "./marketing/heading/HeadingBlockDto";
import { HeroBlockDto } from "./marketing/hero/HeroBlockDto";
import { LogoCloudsBlockDto } from "./marketing/logoClouds/LogoCloudsBlockDto";
// import { NewsletterBlockDto } from "./marketing/newsletter/NewsletterBlockDto";
// import { PricingBlockDto } from "./marketing/pricing/PricingBlockDto";
import { TestimonialsBlockDto } from "./marketing/testimonials/TestimonialsBlockDto";
import { VideoBlockDto } from "./marketing/video/VideoBlockDto";
import { ContentBlockDto } from "./marketing/markdown/ContentBlockDto";
import { ContactFormBlockDto } from "./marketing/contact/ContactFormBlockDto";
import { PricingBlockDto } from "./marketing/pricing/PricingBlockDto";

export const PageBlockTypes = [
  { title: "Header", type: "header" },
  { title: "Footer", type: "footer" },
  { title: "Hero", type: "hero" },
  { title: "Pricing", type: "pricing" },
  { title: "Features", type: "features" },
  { title: "Banner", type: "banner" },
  { title: "Testimonials", type: "testimonials" },
  { title: "Newsletter", type: "newsletter" },
  { title: "Logo Clouds", type: "logoClouds" },
  { title: "FAQ", type: "faq" },
  { title: "Blog Posts", type: "blogPosts" },
  { title: "Blog Post", type: "blogPost" },
  { title: "Community", type: "community" },
  { title: "Heading", type: "heading" },
  { title: "Gallery", type: "gallery" },
  { title: "Video", type: "video" },
  { title: "HTML or Markdown", type: "content" },
];

export type PageBlockDto = {
  // Shared
  error?: string | null;
  layout?: LayoutBlockDto;
  render?: React.ReactNode;
  // Custom blocks
  heading?: HeadingBlockDto;
  banner?: BannerBlockDto;
  header?: HeaderBlockDto;
  footer?: FooterBlockDto;
  hero?: HeroBlockDto;
  gallery?: GalleryBlockDto;
  logoClouds?: LogoCloudsBlockDto;
  video?: VideoBlockDto;
  community?: CommunityBlockDto;
  testimonials?: TestimonialsBlockDto;
  features?: FeaturesBlockDto;
  // newsletter?: NewsletterBlockDto;
  pricing?: PricingBlockDto;
  faq?: FaqBlockDto;
  content?: ContentBlockDto;
  contact?: ContactFormBlockDto;
};
