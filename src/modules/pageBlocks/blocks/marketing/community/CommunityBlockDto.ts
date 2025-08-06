import { GridBlockDto } from "../../shared/grid/GridBlockUtils";

export type CommunityBlockDto = {
  style: CommunityBlockStyle;
  headline: string;
  subheadline: string;
  cta?: { text: string; href: string }[];
  withName?: boolean;
  grid?: GridBlockDto;
  data: {
    members: { user: string; avatar_url: string; url?: string }[];
  };
};

export const CommunityBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type CommunityBlockStyle = (typeof CommunityBlockStyles)[number]["value"];
