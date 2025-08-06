"use client";

import { useTranslation } from "react-i18next";
import { VideoBlockDto } from "@/modules/pageBlocks/blocks/marketing/video/VideoBlockDto";

export default function VideoVariantSimple({ item }: { item: VideoBlockDto }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-24">
        <div className="space-y-8 text-center sm:space-y-12">
          {(item.headline || item.subheadline) && (
            <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
              {item.headline && <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>}
              {item.subheadline && <p className="text-xl text-gray-500">{t(item.subheadline)}</p>}
            </div>
          )}
          <div className="aspect-h-5 aspect-w-16 mx-auto my-12 mt-10 max-w-2xl">
            <iframe
              src={item.src}
              title={item.headline}
              frameBorder="0"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
