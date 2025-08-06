export type ContentBlockDto = {
  style: ContentBlockStyle;
  content: string;
};

export const ContentBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type ContentBlockStyle = (typeof ContentBlockStyles)[number]["value"];
