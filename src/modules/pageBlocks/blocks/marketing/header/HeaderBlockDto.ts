export type HeaderBlockDto = {
  style: HeaderBlockStyle;
  links: NavbarItemDto[];
  withLogo: boolean;
  withSignInAndSignUp: boolean;
  withDarkModeToggle: boolean;
  withLanguageSelector: boolean;
  withThemeSelector?: boolean;
};

export const HeaderBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type HeaderBlockStyle = (typeof HeaderBlockStyles)[number]["value"];

export interface NavbarItemDto {
  id?: string;
  title: string;
  path?: string;
  description?: string;
  className?: string;
  items?: NavbarItemDto[];
  target?: undefined | "_blank";
  hint?: string;
}
