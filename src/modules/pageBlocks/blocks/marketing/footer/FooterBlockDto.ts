import { SocialsBlockDto } from "../socials/SocialsBlockDto";

export type FooterBlockDto = {
  style: FooterBlockStyle;
  text?: string;
  sections: FooterSectionDto[];
  socials?: SocialsBlockDto;
  withDarkModeToggle?: boolean;
  withLanguageSelector?: boolean;
  withThemeSelector?: boolean;
};

export interface FooterSectionDto {
  name: string;
  items: { name: string; href: string; target?: "_blank" }[];
}

export const FooterBlockStyles = [
  { value: "simple", name: "Simple" },
  { value: "columns", name: "Columns" },
] as const;
export type FooterBlockStyle = (typeof FooterBlockStyles)[number]["value"];
