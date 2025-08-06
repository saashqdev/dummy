import { FaqBlockDto } from "@/modules/pageBlocks/blocks/marketing/faq/FaqBlockDto";
import FaqVariantSimple from "./FaqVariantSimple";

export default function FaqBlock({ item }: { item: FaqBlockDto }) {
  return <>{item.style === "simple" && <FaqVariantSimple item={item} />}</>;
}
