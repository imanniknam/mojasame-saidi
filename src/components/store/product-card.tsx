import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductMedia } from "@/components/store/product-media";
import {
  FavoriteToggle,
  QuickAddButton,
} from "@/components/store/product-card-actions";

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
  /** خط توضیح زیر عنوان — دسته یا مشخصات کوتاه */
  subtitleFa?: string | null;
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
  showFavorite?: boolean;
  showQuickAdd?: boolean;
  /** فقط برای کارت اول شبکه — بارگذاری زودهنگام تصویر */
  priority?: boolean;
};

function resolveDiscountPercent(
  explicit: number | null | undefined,
  priceMinor: number | undefined,
  compareAt: number | null | undefined,
): number | null {
  if (explicit != null && explicit > 0) return Math.min(100, explicit);
  if (priceMinor != null && compareAt != null && compareAt > 0 && compareAt > priceMinor) {
    return Math.round(((compareAt - priceMinor) / compareAt) * 100);
  }
  return null;
}

/**
 * کارت محصول — گالری تاریک.
 * تصویر تمام‌عرض، قلب روی تصویر، نوار اطلاعات با عنوان/زیرعنوان/قیمت و کنش سبد.
 */
export function ProductCard({
  href,
  productId,
  titleFa,
  imageUrl,
  imageAlt,
  subtitleFa,
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
  priority = false,
}: ProductCardProps) {
  const discountPercent = resolveDiscountPercent(
    discountPercentProp ?? null,
    priceMinor,
    compareAtMinor ?? null,
  );

  return (
    <article
      className={cn(
        "group/card relative flex flex-col overflow-hidden border border-border bg-card",
        "transition-colors duration-base ease-out hover:border-primary/35",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Link
          href={href}
          className="absolute inset-0 z-0 block"
          aria-label={`مشاهده ${titleFa}`}
        >
          <ProductMedia
            src={imageUrl}
            alt={imageAlt ?? titleFa}
            titleFa={titleFa}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            priority={priority}
            imageClassName="ds-media-zoom"
          />
        </Link>

        {/* نشان‌ها — ابتدای کادر در RTL یعنی راست */}
        <div className="pointer-events-none absolute start-2 top-2 z-[3] flex flex-col items-start gap-1.5">
          {discountPercent != null && discountPercent > 0 ? (
            <span className="bg-destructive px-2 py-1 text-[0.625rem] font-bold text-destructive-foreground">
              {formatPercentFa(discountPercent)} تخفیف
            </span>
          ) : null}
          {badge ? (
            <span className="border border-primary/40 bg-background/80 px-2 py-1 text-[0.625rem] font-bold text-primary backdrop-blur-sm">
              {badge}
            </span>
          ) : null}
        </div>

        {showFavorite ? (
          <div className="absolute end-2 top-2 z-[4]">
            <FavoriteToggle
              productId={productId}
              titleFa={titleFa}
              imageUrl={imageUrl}
              priceMinor={priceMinor}
              href={href}
              defaultFavorite={defaultFavorite}
              className="size-9 min-h-0 min-w-0"
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t border-border/70 p-3 text-center sm:p-3.5">
        <Link href={href} className="block">
          <h3 className="line-clamp-1 text-[0.9375rem] font-bold text-foreground transition-colors duration-fast group-hover/card:text-primary">
            {titleFa}
          </h3>
        </Link>

        {subtitleFa ? (
          <p className="line-clamp-1 text-[0.6875rem] text-muted-foreground">{subtitleFa}</p>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
          {showQuickAdd && priceMinor != null ? (
            <QuickAddButton
              productId={productId}
              titleFa={titleFa}
              imageUrl={imageUrl}
              priceMinor={priceMinor}
              href={href}
              compact
              className="size-9 min-h-0 min-w-0 shrink-0"
            />
          ) : (
            <span />
          )}

          <div className="flex min-w-0 flex-col items-end leading-tight">
            <span
              data-numeric
              className="text-[0.9375rem] font-bold text-primary"
            >
              {priceLabel}
            </span>
            {compareAtLabel ? (
              <span
                data-numeric
                className="text-[0.6875rem] text-muted-foreground line-through"
              >
                {compareAtLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/** اسکلت بارگذاری کارت محصول — همان نسبت تصویر و چیدمان */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border border-border bg-card", className)}>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 border-t border-border/70 p-3 sm:p-3.5">
        <Skeleton className="mx-auto h-4 w-[70%] rounded-sm" />
        <Skeleton className="mx-auto h-3 w-[45%] rounded-sm" />
        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
          <Skeleton className="size-9 rounded-sm" />
          <Skeleton className="h-4 w-24 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
