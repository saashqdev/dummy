export type HeroBlockDto = {
  style: HeroBlockStyle;
  heading: string;
  subheading: string;
  topText?: TextWithLinkDto;
  image?: string;
  cta: {
    text: string;
    href: string;
    isPrimary: boolean;
    target?: undefined | "_blank";
  }[];
  bottomText?: TextWithLinkDto;
};

export const HeroBlockStyles = [
  { value: "simple", name: "Simple" },
  { value: "rightImage", name: "Right Image" },
  { value: "bottomImage", name: "Bottom Image" },
  { value: "topImage", name: "Top Image" },
] as const;
export type HeroBlockStyle = (typeof HeroBlockStyles)[number]["value"];

interface TextWithLinkDto {
  text?: string;
  link?: {
    text?: string;
    href?: string;
    target?: undefined | "_blank";
  };
}
