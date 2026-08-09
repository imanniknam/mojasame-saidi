import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductMedia } from "@/components/store/product-media";

export type CategoryCardProps = {
  href: string;
  nameFa: string;
  subtitleFa?: string | null;
  imageUrl?: string;
  /** تعداد محصولات دسته — اگر داده باشد نمایش داده می‌شود */
  count?: number | null;
  className?: string;
  priority?: boolean;
};

/**
 * کارت مجموعه — تصویر تمام‌قاب با نوار عنوان روی پایه‌ی تیره.
 * عنوان همیشه خوانا می‌ماند چون روی گرادیان محافظ می‌نشیند، نه مستقیم روی عکس.
 */
export function CategoryCard({
  href,
  nameFa,
  subtitleFa,
  imageUrl = "",
  count,
  className,
  priority = false,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block aspect-[4/3] overflow-hidden border border-border bg-card",
        "transition-colors duration-base ease-out hover:border-primary/35",
        className,
      )}
    >
      <ProductMedia
        src={imageUrl}
        alt={nameFa}
        titleFa={nameFa}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
        priority={priority}
        imageClassName="ds-media-zoom"
      />

      {/* گرادیان محافظ — خوانایی عنوان روی هر عکسی */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/75 to-transparent"
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 p-3 text-center sm:p-4">
        <h3 className="text-sm font-bold text-foreground transition-colors duration-fast group-hover:text-primary sm:text-[0.9375rem]">
          {nameFa}
        </h3>
        {/* «۰ اثر» اطلاعاتی به کاربر نمی‌دهد و فروشگاه را خالی‌تر نشان می‌دهد */}
        {count != null && count > 0 ? (
          <p data-numeric className="mt-0.5 text-[0.6875rem] text-muted-foreground">
            {new Intl.NumberFormat("fa-IR").format(count)} اثر
          </p>
        ) : subtitleFa ? (
          <p className="mt-0.5 line-clamp-1 text-[0.6875rem] text-muted-foreground">
            {subtitleFa}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
