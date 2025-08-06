"use client";

import { useTranslation } from "react-i18next";
import { FooterBlockDto } from "@/modules/pageBlocks/blocks/marketing/footer/FooterBlockDto";
import { defaultFooter } from "@/modules/pageBlocks/defaultBlocks/defaultFooter";
import FooterVariantColumns from "./FooterVariantColumns";
import FooterVariantSimple from "./FooterVariantSimple";

export default function FooterBlock({ item }: { item?: FooterBlockDto }) {
  const { t } = useTranslation();
  const footer = item ?? defaultFooter({ t });
  return (
    <>
      {footer && (
        <>
          {footer.style === "simple" && <FooterVariantSimple item={footer} />}
          {footer.style === "columns" && <FooterVariantColumns item={footer} />}
        </>
      )}
    </>
  );
}
