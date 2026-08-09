"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { SORT_OPTIONS, type SortValue } from "@/lib/storefront/sort";
import { Label } from "@/components/ui/label";

export type ListingToolbarProps = {
  total: number;
  sort: SortValue;
};

/**
 * نوار ابزار فهرست — تعداد نتیجه و ترتیب.
 * ترتیب در URL نگه داشته می‌شود تا لینک قابل اشتراک و برای کراولر قابل خواندن بماند.
 */
export function ListingToolbar({ total, sort }: ListingToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function onSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
      <p data-numeric className="text-xs text-muted-foreground sm:text-sm">
        {new Intl.NumberFormat("fa-IR").format(total)} اثر
      </p>

      <div className="flex items-center gap-2">
        {pending ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <ArrowUpDown className="size-4 stroke-[1.6] text-muted-foreground" aria-hidden />
        )}
        <Label htmlFor="listing-sort" className="sr-only">
          ترتیب نمایش
        </Label>
        <select
          id="listing-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="ds-touch-target border border-input bg-card px-2 text-xs text-foreground transition-colors duration-fast hover:border-primary/50 sm:text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.labelFa}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
