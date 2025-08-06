import { ContentBlockDto } from "./ContentBlockDto";
import ContentVariantSimple from "./ContentVariantSimple";

export default function ContentBlock({ item }: { item: ContentBlockDto }) {
  return <>{item.style === "simple" && <ContentVariantSimple item={item} />}</>;
}
