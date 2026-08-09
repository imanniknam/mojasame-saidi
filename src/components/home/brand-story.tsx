import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductMedia, isPendingImage } from "@/components/store/product-media";

export type BrandStoryProps = {
  titleFa: string;
  bodyFa: string;
  ctaHref: string;
  ctaLabel: string;
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
  imageUrl = "",
  imageAlt,
}: BrandStoryProps) {
  const hasPhoto = !isPendingImage(imageUrl);

  return (
    <section className="border-y border-border bg-card" aria-labelledby="brand-story-title">
      <div className="grid lg:grid-cols-2">
        <div className="relative order-1 min-h-[16rem] lg:order-none lg:min-h-[26rem]">
          <ProductMedia
            src={imageUrl}
            alt={imageAlt ?? titleFa}
            titleFa={titleFa}
            sizes="(max-width: 1024px) 100vw, 50vw"
            imageClassName="object-cover"
          />
          {hasPhoto ? (
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-card/60"
              aria-hidden
            />
          ) : null}
        </div>

        <div className="order-2 flex flex-col justify-center px-[var(--section-x)] py-12 lg:order-none lg:py-16">
          <h2 id="brand-story-title" className="ds-title text-foreground">
            {titleFa}
          </h2>
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
