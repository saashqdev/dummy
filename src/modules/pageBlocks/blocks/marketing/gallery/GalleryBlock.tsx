import { GalleryBlockDto } from "@/modules/pageBlocks/blocks/marketing/gallery/GalleryBlockDto";
import GalleryVariantCarousel from "./GalleryVariantCarousel";

export default function GalleryBlock({ item }: { item: GalleryBlockDto }) {
  return <>{item.style === "carousel" && <GalleryVariantCarousel item={item} />}</>;
}
