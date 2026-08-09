import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EmptyStateProps = {
  titleFa: string;
  descriptionFa?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

/** حالت خالی — به‌جای شبکه‌ی سفید، یک مسیر خروج به کاربر می‌دهد */
export function EmptyState({
  titleFa,
  descriptionFa,
  ctaHref,
  ctaLabel,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-border bg-card px-6 py-16 text-center">
      <PackageOpen className="size-9 stroke-[1.2] text-muted-foreground/60" aria-hidden />
      <h2 className="ds-heading mt-4 text-foreground">{titleFa}</h2>
      {descriptionFa ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{descriptionFa}</p>
      ) : null}
      {ctaHref && ctaLabel ? (
        <Button variant="outline" size="touch" className="mt-6 px-6" asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
