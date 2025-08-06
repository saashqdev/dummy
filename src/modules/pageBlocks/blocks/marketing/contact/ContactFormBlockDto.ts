export type ContactFormBlockDto = {
  style: ContactFormBlockStyle;
  data: ContactFormBlockData;
};
export type ContactFormBlockData = {
  actionUrl: string | undefined;
};
export const ContactFormBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type ContactFormBlockStyle = (typeof ContactFormBlockStyles)[number]["value"];
