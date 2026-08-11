"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeader } from "@/components/home/section-header";
import { formatPriceFa } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/lib/storefront/types";

export type ProductSliderProps = {
  titleFa: string;
  overline?: string;
  linkHref?: string;
  linkLabel?: string;
  products: StoreProduct[];
};

/**
 * اسلایدر افقی محصولات — جایگزین بخش «داستان برند» در صفحه اصلی.
 *
 * روی موبایل با کشیدن انگشت اسکرول می‌شود (اسکرول بومی، بدون جاوااسکریپت
 * اضافه)؛ روی دسکتاپ دو دکمه‌ی فلش هم اضافه شده‌اند. جهت اسکرول به‌طور طبیعی
 * راست‌به‌چپ است چون کل صفحه dir="rtl" دارد — دکمه‌ی «فلش راست» یعنی برو به
 * آیتم بعدی (چپ‌تر)، مطابق جهت خواندن فارسی.
 */
export function ProductSlider({
  titleFa,
  overline,
  linkHref,
  linkLabel,
  products,
}: ProductSliderProps) {
  const trackRef = useRef<HTMLUListElement>(null);

  if (products.length === 0) return null;

  function scrollByAmount(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-slide]");
    const step = (card?.offsetWidth ?? 260) + 16;
    // در RTL مقدار مثبت scrollLeft به چپ (سمت «قبل») می‌رود؛ برای «بعدی» باید منفی بدهیم.
    track.scrollBy({ left: direction * -step, behavior: "smooth" });
  }

  return (
    <section className="ds-container ds-section">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <SectionHeader
            titleFa={titleFa}
            overline={overline}
            linkHref={linkHref}
            linkLabel={linkLabel}
            className="mb-0 flex-1"
          />
        </div>

        <div className="mb-5 hidden shrink-0 gap-2 sm:mb-7 md:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="محصولات بعدی"
            onClick={() => scrollByAmount(1)}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="محصولات قبلی"
            onClick={() => scrollByAmount(-1)}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="scrollbar-none -mx-[var(--section-x)] flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-[var(--section-x)] pb-2 sm:gap-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, index) => (
          <li
            key={product.id}
            data-slide
            className="w-[46vw] shrink-0 snap-start sm:w-56 lg:w-64"
          >
            <ProductCard
              href={`/products/${product.slug}`}
              productId={product.id}
              titleFa={product.titleFa}
              imageUrl={product.imageUrl}
              subtitleFa={product.categoryNameFa}
              priceMinor={product.priceMinor}
              compareAtMinor={product.compareAtMinor}
              priceLabel={formatPriceFa(product.priceMinor)}
              compareAtLabel={
                product.compareAtMinor ? formatPriceFa(product.compareAtMinor) : null
              }
              badge={product.isNew ? "جدید" : product.isBestSeller ? "پرفروش" : null}
              priority={index === 0}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
