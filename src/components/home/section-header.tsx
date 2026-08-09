import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  titleFa: string;
  /** روتیتر لاتین — اختیاری، سبک تحریریه‌ای */
  overline?: string;
  linkHref?: string;
  linkLabel?: string;
  className?: string;
};

/**
 * سربرگ بخش — عنوان در ابتدای سطر (راست در RTL)، پیوند «مشاهده همه» در انتها.
 * فلش به چپ اشاره می‌کند چون در RTL جهت «جلو» همان چپ است.
 */
export function SectionHeader({
  titleFa,
  overline,
  linkHref,
  linkLabel = "مشاهده همه",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4 sm:mb-7", className)}>
      <div className="min-w-0">
        {overline ? <p className="ds-overline mb-1.5">{overline}</p> : null}
        <h2 className="ds-title text-foreground">{titleFa}</h2>
      </div>

      {linkHref ? (
        <Link
          href={linkHref}
          className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-xs font-semibold text-muted-foreground transition-colors duration-fast hover:text-primary sm:text-sm"
        >
          {linkLabel}
          <ArrowLeft
            className="size-4 transition-transform duration-base ease-out group-hover:-translate-x-1"
            aria-hidden
          />
        </Link>
      ) : null}
    </div>
  );
}
