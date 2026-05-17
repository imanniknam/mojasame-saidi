import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export type CategoryCardProps = {
  href: string;
  nameFa: string;
  subtitleFa?: string | null;
  /** تصویر اختیاری دسته */
  imageUrl?: string | null;
  className?: string;
};

/** کارت دسته — مینیمال، تایپوگرافی فارسی */
export function CategoryCard({
  href,
  nameFa,
  subtitleFa,
  imageUrl,
  className,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn("group block touch-manipulation outline-none", className)}
    >
      <Card className="relative overflow-hidden rounded-[1.25rem] border-highlight/10 bg-card/80 p-0 transition-[transform,border-color,box-shadow] duration-300 hover:border-highlight/30 hover:shadow-card active:scale-[0.99]">
        <div
          className={cn(
            "flex min-h-[5.5rem] flex-col justify-end gap-0.5 bg-gradient-to-br from-card-elevated via-card to-background p-4 sm:min-h-[6.25rem] sm:p-5",
            imageUrl && "min-h-[7.5rem] sm:min-h-[8.5rem]",
          )}
        >
          {imageUrl ? (
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.18] grayscale transition duration-500 group-hover:scale-105 group-hover:opacity-30"
              style={{ backgroundImage: `url(${imageUrl})` }}
              aria-hidden
            />
          ) : null}
          <div className="relative">
            <span className="ds-overline mb-1 block text-[0.65rem] text-highlight opacity-90">
              دسته
            </span>
            <h3 className="text-start text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
              {nameFa}
            </h3>
            {subtitleFa ? (
              <p className="mt-1 line-clamp-2 text-start text-xs text-muted-foreground sm:text-sm">
                {subtitleFa}
              </p>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
