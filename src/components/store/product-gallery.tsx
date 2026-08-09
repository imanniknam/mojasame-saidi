"use client";

import { useState } from "react";
import { ProductMedia, isPendingImage } from "@/components/store/product-media";
import { cn } from "@/lib/utils";

export type ProductGalleryProps = {
  images: string[];
  titleFa: string;
  categoryFa?: string;
};

/**
 * گالری محصول — تصویر اصلی روی صحنه‌ی تیره، بندانگشتی‌ها زیر آن.
 * وقتی فقط یک تصویر (یا هیچ تصویر واقعی) هست، ردیف بندانگشتی رندر نمی‌شود.
 */
export function ProductGallery({ images, titleFa, categoryFa }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const usable = images.length > 0 ? images : [""];
  const showThumbs = usable.length > 1 && !usable.every(isPendingImage);
  const current = usable[Math.min(active, usable.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden border border-border bg-card">
        <ProductMedia
          src={current}
          alt={titleFa}
          titleFa={titleFa}
          categoryFa={categoryFa}
          sizes="(max-width: 1024px) 100vw, 600px"
          priority
          imageClassName="object-cover"
        />
      </div>

      {showThumbs ? (
        <ul className="grid grid-cols-5 gap-2" role="list">
          {usable.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`نمایش تصویر ${new Intl.NumberFormat("fa-IR").format(index + 1)} از ${titleFa}`}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden border transition-colors duration-fast",
                  index === active
                    ? "border-primary"
                    : "border-border hover:border-primary/40",
                )}
              >
                <ProductMedia
                  src={src}
                  alt=""
                  titleFa={titleFa}
                  sizes="120px"
                  imageClassName="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
