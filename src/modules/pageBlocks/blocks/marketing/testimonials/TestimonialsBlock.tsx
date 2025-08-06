import { TestimonialsBlockDto } from "@/modules/pageBlocks/blocks/marketing/testimonials/TestimonialsBlockDto";
import TestimonialsVariantSimple from "./TestimonialsVariantSimple";

export default function TestimonialsBlock({ item }: { item: TestimonialsBlockDto }) {
  return <>{item.style === "simple" && <TestimonialsVariantSimple item={item} />}</>;
}
