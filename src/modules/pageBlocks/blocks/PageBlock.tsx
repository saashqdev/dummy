"use client";

import { PageBlockDto } from "./PageBlockDto";
import BannerBlock from "./marketing/banner/BannerBlock";
import CommunityBlock from "./marketing/community/CommunityBlock";
import FaqBlock from "./marketing/faq/FaqBlock";
import FeaturesBlock from "./marketing/features/FeaturesBlock";
import FooterBlock from "./marketing/footer/FooterBlock";
import GalleryBlock from "./marketing/gallery/GalleryBlock";
import HeaderBlock from "./marketing/header/HeaderBlock";
import HeadingBlock from "./marketing/heading/HeadingBlock";
import HeroBlock from "./marketing/hero/HeroBlock";
import LogoCloudsBlock from "./marketing/logoClouds/LogoCloudsBlock";
// import NewsletterBlock from "./marketing/newsletter/NewsletterBlock";
import PricingBlock from "./marketing/pricing/PricingBlock";
import TestimonialsBlock from "./marketing/testimonials/TestimonialsBlock";
import VideoBlock from "./marketing/video/VideoBlock";
import ContentBlock from "./marketing/markdown/ContentBlock";
import ContactFormBlock from "./marketing/contact/ContactFormBlock";

export function PageBlock({ item }: { item: PageBlockDto }) {
  return (
    <>
      {item.render && item.render}
      {item.heading && <HeadingBlock item={item.heading} />}
      {item.banner && <BannerBlock item={item.banner} />}
      {item.header && <HeaderBlock item={item.header} />}
      {item.footer && <FooterBlock item={item.footer} />}
      {item.hero && <HeroBlock item={item.hero} />}
      {item.gallery && <GalleryBlock item={item.gallery} />}
      {item.logoClouds && <LogoCloudsBlock item={item.logoClouds} />}
      {item.video && <VideoBlock item={item.video} />}
      {item.community && <CommunityBlock item={item.community} />}
      {item.testimonials && <TestimonialsBlock item={item.testimonials} />}
      {item.features && <FeaturesBlock item={item.features} />}
      {/* {item.newsletter && <NewsletterBlock item={item.newsletter} />} */}
      {item.faq && <FaqBlock item={item.faq} />}
      {item.pricing && <PricingBlock item={item.pricing} />}
      {item.content && <ContentBlock item={item.content} />}
      {item.contact && <ContactFormBlock item={item.contact} />}
    </>
  );
}
