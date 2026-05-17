import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardActions } from "@/components/store/product-card-actions";

function formatPercentFa(n: number): string {
  const rounded = Math.min(100, Math.max(0, Math.round(n)));
  return `${new Intl.NumberFormat("fa-IR").format(rounded)}٪`;
}

export type ProductCardProps = {
  href: string;
  productId: string;
  titleFa: string;
  imageUrl: string;
  imageAlt?: string;
  /** قیمت نهایی (با تخفیف) — نمایش */
  priceLabel: string;
  /** قیمت قبل از تخفیف — اختیاری */
  compareAtLabel?: string | null;
  /** درصد تخفیف برای نشان — اگر نباشد ولی compareAt باشد، از اعداد محاسبه می‌شود */
  discountPercent?: number | null;
  /** برای محاسبه خودکار درصد تخفیف */
  priceMinor?: number;
  compareAtMinor?: number | null;
  badge?: "جدید" | "ویژه" | "پرفروش" | string | null;
  className?: string;
  defaultFavorite?: boolean;
  /** اگر false باشد دکمه علاقه‌مندی مخفی می‌شود */
  showFavorite?: boolean;
  showQuickAdd?: boolean;
};

function resolveDiscountPercent(
  explicit: number | null | undefined,
  priceMinor: number | undefined,
  compareAt: number | null | undefined,
): number | null {
  if (explicit != null && explicit > 0) return Math.min(100, explicit);
  if (
    priceMinor != null &&
    compareAt != null &&
    compareAt > 0 &&
    compareAt > priceMinor
  ) {
    return Math.round(((compareAt - priceMinor) / compareAt) * 100);
  }
  return null;
}

/** کارت محصول لوکس — RTL، موبایل‌اول، انیمیشن، علاقه‌مندی، افزودن سریع */
export function ProductCard({
  href,
  productId,
  titleFa,
  imageUrl,
  imageAlt,
  priceLabel,
  compareAtLabel,
  discountPercent: discountPercentProp,
  priceMinor,
  compareAtMinor,
  badge,
  className,
  defaultFavorite = false,
  showFavorite = true,
  showQuickAdd = true,
}: ProductCardProps) {
  const discountPercent = resolveDiscountPercent(
    discountPercentProp ?? null,
    priceMinor,
    compareAtMinor ?? null,
  );

  return (
    <article
      className={cn(
        "touch-manipulation outline-none transition-transform duration-300 ease-out motion-reduce:transform-none",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1",
        className,
      )}
    >
      <Card
        elevated
        className="group/card relative overflow-hidden rounded-[1.35rem] border-highlight/10 bg-card/90 p-0 shadow-elegant transition-[border-color,box-shadow] duration-300 hover:border-highlight/30 hover:shadow-float"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-background/70">
          <Link
            href={href}
            className="absolute inset-0 z-0 block outline-none ring-inset focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`مشاهده ${titleFa}`}
          >
            <div className="relative h-full w-full md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:scale-[1.04]">
              <Image
                src={imageUrl}
                alt={imageAlt ?? titleFa}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                className="object-cover opacity-95 saturate-[0.9] transition duration-500 group-hover/card:opacity-100 group-hover/card:saturate-100"
                unoptimized={/\.svg$/i.test(imageUrl)}
                priority={false}
              />
            </div>
          </Link>

          {/* لایه کنترل: روشنایی ملایم روی هاور دسکتاپ */}
          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-background/55 via-transparent to-highlight/[0.08] opacity-80 transition-opacity duration-300 group-hover/card:opacity-100"
            aria-hidden
          />

          <div className="pointer-events-none absolute start-2 top-2 z-[3] flex max-w-[70%] flex-col items-start gap-1.5 sm:start-2.5 sm:top-2.5">
            {discountPercent != null && discountPercent > 0 ? (
              <Badge
                variant="destructive"
                className="border border-destructive/20 shadow-elegant backdrop-blur-[2px]"
              >
                {formatPercentFa(discountPercent)} تخفیف
              </Badge>
            ) : null}
            {badge ? (
              <Badge variant="highlight" className="border border-highlight/30 shadow-elegant backdrop-blur-[2px]">
                {badge}
              </Badge>
            ) : null}
          </div>

          <ProductCardActions
            productId={productId}
            titleFa={titleFa}
            imageUrl={imageUrl}
            href={href}
            priceMinor={priceMinor}
            defaultFavorite={defaultFavorite}
            showFavorite={showFavorite}
            showQuickAdd={showQuickAdd}
          />
        </div>

        <div className="relative z-[1] space-y-2 border-t border-border/55 bg-card/95 p-3.5 sm:p-4">
          <Link
            href={href}
            className="block rounded-md text-start outline-none ring-offset-background transition-colors hover:text-highlight focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-[0.9375rem]">
              {titleFa}
            </h3>
          </Link>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-base font-bold tabular-nums text-highlight sm:text-lg">
              {priceLabel}
            </span>
            {compareAtLabel ? (
              <span className="text-sm text-muted-foreground line-through tabular-nums">
                {compareAtLabel}
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </article>
  );
}

/** اسکلت بارگذاری کارت محصول — همان نسبت تصویر و چیدمان موبایل */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      elevated
      className={cn(
        "overflow-hidden border-border/70 p-0 shadow-elegant",
        className,
      )}
    >
      <Skeleton className="aspect-[4/5] w-full rounded-none rounded-t-xl" />
      <div className="space-y-3 p-3.5 sm:p-4">
        <Skeleton className="h-4 w-[92%] rounded-md" />
        <Skeleton className="h-4 w-[60%] rounded-md" />
        <div className="flex items-center justify-between gap-2 pt-1">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md opacity-70" />
        </div>
      </div>
    </Card>
  );
}
