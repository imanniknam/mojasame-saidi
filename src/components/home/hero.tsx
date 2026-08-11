import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductMedia, isPendingImage } from "@/components/store/product-media";
import { BrandGlyph } from "@/components/layout/brand-mark";
import { cn } from "@/lib/utils";

export type HeroProps = {
  titleFa: string;
  subtitleFa: string;
  ctaHref: string;
  ctaLabel: string;
  /** تصویر تحریریه‌ی ثابت برای هویت بصری Hero */
  backgroundImageUrl?: string;
  backgroundImageAlt?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** اثر شاخص — تصویر پس‌زمینه‌ی قهرمان */
  feature?: {
    titleFa: string;
    imageUrl: string;
    href: string;
    categoryFa?: string;
  } | null;
};

/**
 * بخش قهرمان.
 *
 * وقتی عکاسی واقعی موجود باشد، تصویر تمام‌قاب پشت متن می‌نشیند و متن روی
 * لایه‌ی محافظ خوانا می‌ماند. تا وقتی عکسی نیست، به‌جای نمایش یک جانگهدارِ
 * شکسته، چیدمان تایپوگرافیک با مونوگرام برند رندر می‌شود — عامدانه، نه ناقص.
 */
export function Hero({
  titleFa,
  subtitleFa,
  ctaHref,
  ctaLabel,
  backgroundImageUrl,
  backgroundImageAlt,
  secondaryHref,
  secondaryLabel,
  feature,
}: HeroProps) {
  const heroImageUrl = backgroundImageUrl ?? feature?.imageUrl ?? "";
  const heroImageAlt = backgroundImageAlt ?? feature?.titleFa ?? titleFa;
  const hasPhoto = !isPendingImage(heroImageUrl);

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b border-border",
        hasPhoto ? "bg-background" : "ds-stage",
      )}
      aria-labelledby="hero-title"
    >
      {hasPhoto ? (
        <>
          <div className="absolute inset-0 -z-10">
            <ProductMedia
              src={heroImageUrl}
              alt={heroImageAlt}
              titleFa={titleFa}
              sizes="100vw"
              priority
              imageClassName="object-cover object-[68%_center] sm:object-[64%_center]"
            />
          </div>
          {/* فضای خالیِ سمت چپ تصویر محل متن است؛ این لایه کنتراست را ثابت نگه می‌دارد. */}
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/80 to-background/5"
            aria-hidden
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/45"
            aria-hidden
          />
        </>
      ) : null}

      <div className="ds-container flex min-h-[clamp(31rem,68vh,45rem)] flex-col justify-center py-16 sm:py-20">
        <div className="max-w-xl lg:ms-auto lg:w-[44%]">
          {!hasPhoto ? (
            <BrandGlyph className="mb-6 size-14 text-primary/70" />
          ) : null}

          {hasPhoto ? <p className="ds-overline mb-4">Saeidi Sculpture</p> : null}

          <h1
            id="hero-title"
            className="ds-display max-w-[11ch] text-foreground drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]"
          >
            {titleFa}
          </h1>

          <p className="ds-body mt-5 max-w-md text-foreground/80 drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]">
            {subtitleFa}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="luxury" size="touch" className="group gap-2 px-6" asChild>
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowLeft
                  className="size-4 transition-transform duration-base ease-out group-hover:-translate-x-1"
                  aria-hidden
                />
              </Link>
            </Button>

            {secondaryHref && secondaryLabel ? (
              <Button variant="outline" size="touch" className="px-6" asChild>
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {hasPhoto && feature ? (
        <Link
          href={feature.href}
          className="absolute bottom-5 end-5 z-10 hidden border border-border/70 bg-background/70 px-4 py-3 text-start backdrop-blur-md transition-colors duration-fast hover:border-primary/40 lg:block"
        >
          <span className="block text-[0.625rem] text-muted-foreground">اثر منتخب</span>
          <span className="mt-0.5 block text-sm font-bold text-foreground">
            {feature.titleFa}
          </span>
        </Link>
      ) : null}
    </section>
  );
}
