import { TFunction } from "i18next";
import { HeaderBlockDto } from "@/modules/pageBlocks/blocks/marketing/header/HeaderBlockDto";

export function defaultHeader({ t }: { t: TFunction }): HeaderBlockDto {
  return {
    style: "simple",
    withLogo: true,
    withSignInAndSignUp: true,
    withDarkModeToggle: true,
    withLanguageSelector: true,
    withThemeSelector: true,
    links: [
      { path: "/pricing", title: t("front.navbar.pricing") },
      {
        title: t("shared.more"),
        items: [
          { path: "/contact", title: "front.navbar.contact" },
          { path: "/newsletter", title: "Newsletter" },
          { path: "/rockstack-vs-saasrock", title: "RockStack vs SaasRock" },
        ],
      },
    ],
  };
}
