import { HeroBlockDto } from "@/modules/pageBlocks/blocks/marketing/hero/HeroBlockDto";
import HeroVariantSimple from "./HeroVariantSimple";
import HeroVariantRightImage from "./HeroVariantRightImage";
import HeroVariantTopImage from "./HeroVariantTopImage";
import HeroVariantBottomImage from "./HeroVariantBottomImage";

export default function HeroBlock({ item }: { item: HeroBlockDto }) {
  return (
    <>
      {item.style === "simple" && <HeroVariantSimple item={item} />}
      {item.style === "rightImage" && <HeroVariantRightImage item={item} />}
      {item.style === "topImage" && <HeroVariantTopImage item={item} />}
      {item.style === "bottomImage" && <HeroVariantBottomImage item={item} />}
    </>
  );
}
