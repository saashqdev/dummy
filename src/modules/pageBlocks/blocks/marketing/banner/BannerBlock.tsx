import { BannerBlockDto } from "@/modules/pageBlocks/blocks/marketing/banner/BannerBlockDto";
import BannerVariantTop from "./BannerVariantTop";
import BannerVariantBottom from "./BannerVariantBottom";

export default function BannerBlock({ item }: { item?: BannerBlockDto }) {
  return (
    <>
      {item?.style === "top" && <BannerVariantTop item={item} />}
      {item?.style === "bottom" && <BannerVariantBottom item={item} />}
    </>
  );
}
