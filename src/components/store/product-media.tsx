import Image from "next/image";
import { cn } from "@/lib/utils";

/** تصویر جانگهدار قدیمی — تا وقتی عکاسی محصولات آماده نشده، جای عکس واقعی است */
const PLACEHOLDER_PATTERN = /placeholder-product\.svg$/i;

export function isPendingImage(url: string | null | undefined): boolean {
  return !url || PLACEHOLDER_PATTERN.test(url);
}

export type ProductMediaProps = {
  src: string;
  alt: string;
  /** نام دسته — روی حالت «در انتظار تصویر» نمایش داده می‌شود */
  categoryFa?: string;
  /** عنوان محصول — حرف اول آن در مونوگرام می‌نشیند */
  titleFa?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** کلاس روی خودِ تصویر — برای زوم هاور */
  imageClassName?: string;
};

/**
 * ناحیه‌ی تصویر محصول.
 *
 * تا وقتی عکاسی واقعی بارگذاری نشده، به‌جای نمایش یک SVG خاکستری شکسته،
 * یک صحنه‌ی تایپوگرافیک عامدانه رندر می‌شود: مونوگرام حرف اول محصول روی
 * وینیت گرم، با برچسب دسته. ابعاد و نسبت دقیقاً همان تصویر واقعی است،
 * پس وقتی عکس‌ها اضافه شوند هیچ جابه‌جایی در چیدمان رخ نمی‌دهد.
 */
export function ProductMedia({
  src,
  alt,
  categoryFa,
  titleFa,
  sizes,
  priority = false,
  className,
  imageClassName,
}: ProductMediaProps) {
  if (isPendingImage(src)) {
    const initial = (titleFa ?? "").trim().charAt(0) || "س";

    return (
      <div
        className={cn(
          "ds-stage relative flex h-full w-full flex-col items-center justify-center overflow-hidden",
          className,
        )}
        role="img"
        aria-label={`${alt} — تصویر به‌زودی`}
      >
        <span
          aria-hidden
          className="font-display text-[clamp(3rem,14vw,5.5rem)] font-bold leading-none text-primary/25"
        >
          {initial}
        </span>
        {categoryFa ? (
          <span
            aria-hidden
            className="mt-3 text-[0.625rem] font-semibold tracking-[0.14em] text-muted-foreground/70"
          >
            {categoryFa}
          </span>
        ) : null}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 border-t border-border/60 bg-background/40 py-1.5 text-center text-[0.625rem] font-medium text-muted-foreground/60"
        >
          تصویر به‌زودی
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", imageClassName)}
    />
  );
}
