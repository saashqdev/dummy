import { HeadingBlockDto } from "./HeadingBlockDto";
import HeadingVariantCentered from "./HeadingVariantCentered";
import HeadingVariantLeft from "./HeadingVariantLeft";
import HeadingVariantRight from "./HeadingVariantRight";

export default function HeadingBlock({ item }: { item: HeadingBlockDto }) {
  return (
    <>
      {(!item.style || item.style === "centered") && <HeadingVariantCentered item={item} />}
      {item.style === "left" && <HeadingVariantLeft item={item} />}
      {item.style === "right" && <HeadingVariantRight item={item} />}
    </>
  );
}
