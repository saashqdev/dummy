"use client";

import { useTranslation } from "react-i18next";
import { GalleryBlockDto } from "@/modules/pageBlocks/blocks/marketing/gallery/GalleryBlockDto";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import clsx from "clsx";
import { Card } from "@/components/ui/card";

export default function GalleryVariantCarousel({ item }: { item: GalleryBlockDto }) {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden py-8">
      <div className="mx-auto max-w-5xl space-y-8 px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-5xl lg:px-8">
        <div>
          {item.topText && <h2 className="text-theme-600 text-base font-semibold uppercase tracking-wider">{item.topText}</h2>}
          {item.headline && <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</p>}
          {item.subheadline && <p className="mx-auto mt-5 max-w-prose text-base text-muted-foreground">{t(item.subheadline)}</p>}
        </div>
        <div className="mx-auto">
          <CustomCarousel items={item.items} />
        </div>
      </div>
    </div>
  );
}

interface CarouselProps {
  items: { type?: string; title?: string; src: string }[];
  size?: "sm" | "md" | "lg" | "full";
}

function CustomCarousel({ items, size = "full" }: CarouselProps) {
  const [currentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<{ type?: string; title?: string; src: string } | undefined>(undefined);
  const [, setCurrentSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (items.length > currentIndex) {
      setCurrentItem(items[currentIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, currentIndex]);

  useEffect(() => {
    setCurrentSrc(currentItem?.src);
  }, [currentItem]);

  // function nextImage() {
  //   if (items.length > currentIndex + 1) {
  //     setCurrentIndex(currentIndex + 1);
  //   } else {
  //     setCurrentIndex(0);
  //   }
  // }

  // function previousImage() {
  //   if (currentIndex === 0) {
  //     setCurrentIndex(items.length - 1);
  //   } else {
  //     setCurrentIndex(currentIndex - 1);
  //   }
  // }

  return <CarouselItems items={items} size={size} />;
}

export function CarouselItems({ items, size }: CarouselProps) {
  return (
    <Carousel
      className={clsx("mx-auto w-full", size === "sm" && "max-w-xs", size === "md" && "max-w-md", size === "lg" && "max-w-lg", size === "full" && "max-w-full")}
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="overflow-hidden rounded-lg">
                {(!item.type || item.type === "image") && (
                  <img
                    key={item.src}
                    loading="lazy"
                    className={clsx("min-h-full w-full object-cover md:h-auto", size === "sm" && "h-48", size === "md" && "h-64", size === "lg" && "h-96")}
                    src={item.src}
                    alt={item.title}
                  />
                )}
                {item?.type === "video" && (
                  <iframe
                    key={item.src}
                    src={item.src}
                    title={item?.title ?? ""}
                    loading="lazy"
                    className="h-96 min-h-full w-full object-cover md:h-auto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                )}
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
