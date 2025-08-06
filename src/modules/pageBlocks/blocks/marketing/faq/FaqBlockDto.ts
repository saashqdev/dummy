export type FaqBlockDto = {
  style: FaqBlockStyle;
  headline?: string;
  subheadline?: string;
  items: {
    question: string;
    answer: string;
    link?: {
      text: string;
      href: string;
    };
  }[];
};
export type FaqItemDto = FaqBlockDto["items"][number];
export const FaqBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type FaqBlockStyle = (typeof FaqBlockStyles)[number]["value"];
