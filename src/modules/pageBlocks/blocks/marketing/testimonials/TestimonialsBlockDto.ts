export type TestimonialsBlockDto = {
  style: TestimonialsBlockStyle;
  headline: string;
  subheadline: string;
  items: TestimonialDto[];
};
export type TestimonialDto = {
  quote: string;
  name: string;
  company?: string;
  companyUrl?: string;
  logoLightMode?: string;
  logoDarkMode?: string;
  title?: string;
  personalWebsite?: string;
  avatar?: string;
  role?: string;
  createdAt?: Date;
  quoteUrl?: string;
  stars?: number;
};
export const TestimonialsBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type TestimonialsBlockStyle = (typeof TestimonialsBlockStyles)[number]["value"];
