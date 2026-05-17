import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminPaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
};

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function AdminPagination({ page, totalPages, basePath, searchParams }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 px-4 py-3"
      aria-label="صفحه‌بندی"
    >
      <p className="text-sm text-muted-foreground">
        صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
      </p>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={buildHref(basePath, searchParams, prev)}
            className={cn(
              "inline-flex min-h-touch items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted/40",
            )}
          >
            <ChevronRight className="size-4" aria-hidden />
            قبلی
          </Link>
        ) : (
          <span className="inline-flex min-h-touch items-center gap-1 rounded-lg border border-border/40 px-3 text-sm text-muted-foreground/50">
            <ChevronRight className="size-4" aria-hidden />
            قبلی
          </span>
        )}
        {next ? (
          <Link
            href={buildHref(basePath, searchParams, next)}
            className={cn(
              "inline-flex min-h-touch items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted/40",
            )}
          >
            بعدی
            <ChevronLeft className="size-4" aria-hidden />
          </Link>
        ) : (
          <span className="inline-flex min-h-touch items-center gap-1 rounded-lg border border-border/40 px-3 text-sm text-muted-foreground/50">
            بعدی
            <ChevronLeft className="size-4" aria-hidden />
          </span>
        )}
      </div>
    </nav>
  );
}
