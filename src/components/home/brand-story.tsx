import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductMedia, isPendingImage } from "@/components/store/product-media";

export type BrandStoryProps = {
  titleFa: string;
  bodyFa: string;
  ctaHref: string;
  ctaLabel: string;
  overline?: string;
  imageUrl?: string;
  imageAlt?: string;
};

/**
 * بخش داستان برند — تصویر فضا در یک سو، متن در سوی دیگر.
 * روی موبایل تصویر بالا و متن پایین می‌نشیند تا خواندن مقدم بر تزئین باشد.
 */
export function BrandStory({
  titleFa,
  bodyFa,
  ctaHref,
  ctaLabel,
  overline = "About us",
  imageUrl = "",
  imageAlt,
}: BrandStoryProps) {
  const hasPhoto = !isPendingImage(imageUrl);

  return (
    <section
      className="relative overflow-hidden border-y border-border bg-card"
      aria-labelledby="brand-story-title"
    >
      <div className="grid lg:grid-cols-2 lg:[direction:ltr]">
        <div className="relative min-h-[19rem] lg:min-h-[34rem]">
          <ProductMedia
            src={imageUrl}
            alt={imageAlt ?? titleFa}
            titleFa={titleFa}
            sizes="(max-width: 1024px) 100vw, 50vw"
            imageClassName="object-cover object-center"
          />
          {hasPhoto ? (
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-l from-card/70 via-transparent to-transparent lg:from-card/85"
              aria-hidden
            />
          ) : null}
        </div>

        <div className="relative flex flex-col justify-center px-[var(--section-x)] py-12 lg:px-[clamp(2.5rem,6vw,6rem)] lg:py-16 lg:[direction:rtl]">
          <p className="ds-overline">{overline}</p>
          <h2 id="brand-story-title" className="ds-title text-foreground">
            <span className="mt-3 block">{titleFa}</span>
          </h2>
          <span className="mt-5 h-px w-20 bg-primary/60" aria-hidden />
          <p className="ds-prose mt-5 whitespace-pre-line">{bodyFa}</p>

          <div className="mt-8">
            <Button variant="luxury" size="touch" className="group gap-2 px-6" asChild>
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowLeft
                  className="size-4 transition-transform duration-base ease-out group-hover:-translate-x-1"
                  aria-hidden
                />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
