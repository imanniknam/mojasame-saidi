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
  secondaryHref,
  secondaryLabel,
  feature,
}: HeroProps) {
  const hasPhoto = feature != null && !isPendingImage(feature.imageUrl);

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b border-border",
        hasPhoto ? "bg-background" : "ds-stage",
      )}
      aria-labelledby="hero-title"
    >
      {hasPhoto && feature ? (
        <>
          <div className="absolute inset-0 -z-10">
            <ProductMedia
              src={feature.imageUrl}
              alt={feature.titleFa}
              titleFa={feature.titleFa}
              sizes="100vw"
              priority
              imageClassName="object-cover"
            />
          </div>
          {/* لایه‌ی محافظ — از راست (ابتدای متن) تیره‌تر تا متن همیشه خوانا بماند */}
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-l from-background via-background/85 to-background/35"
            aria-hidden
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/60"
            aria-hidden
          />
        </>
      ) : null}

      <div className="ds-container flex min-h-[clamp(26rem,62vh,38rem)] flex-col justify-center py-16 sm:py-20">
        <div className="max-w-xl">
          {!hasPhoto ? (
            <BrandGlyph className="mb-6 size-14 text-primary/70" />
          ) : null}

          <h1
            id="hero-title"
            className="ds-display text-primary"
          >
            {titleFa}
          </h1>

          <p className="ds-body mt-5 max-w-md text-muted-foreground">{subtitleFa}</p>

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
