import { VideoBlockDto } from "@/modules/pageBlocks/blocks/marketing/video/VideoBlockDto";
import VideoVariantSimple from "./VideoVariantSimple";

export default function VideoBlock({ item }: { item: VideoBlockDto }) {
  return <>{item.style === "simple" && <VideoVariantSimple item={item} />}</>;
}
