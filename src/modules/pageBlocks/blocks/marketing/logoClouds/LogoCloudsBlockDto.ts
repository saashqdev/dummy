export type LogoCloudsBlockDto = {
  style: LogoCloudsBlockStyle;
  headline?: string;
  logos?: LogoCloudDto[];
};

export interface LogoCloudDto {
  src: string;
  srcDark?: string;
  alt: string;
  href: string;
}

export const LogoCloudsBlockStyles = [
  { value: "custom", name: "Custom" },
  { value: "simple", name: "Simple" },
  { value: "withBrand", name: "With Brand" },
] as const;
export type LogoCloudsBlockStyle = (typeof LogoCloudsBlockStyles)[number]["value"];
