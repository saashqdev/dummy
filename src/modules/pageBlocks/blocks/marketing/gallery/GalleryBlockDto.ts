export type GalleryBlockDto = {
  style: GalleryBlockStyle;
  topText?: string;
  headline?: string;
  subheadline?: string;
  items: GalleryItemDto[];
};
export type GalleryItemDto = { type: string; title: string; src: string };
export const GalleryBlockStyles = [{ value: "carousel", name: "List" }] as const;
export type GalleryBlockStyle = (typeof GalleryBlockStyles)[number]["value"];
