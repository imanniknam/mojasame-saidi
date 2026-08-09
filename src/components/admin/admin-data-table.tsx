import type { AdminTableColumn } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export type AdminDataTableProps<T extends { id: string }> = {
  columns: AdminTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  caption?: string;
};

/**
 * جدول داده‌ی پنل.
 *
 * دسکتاپ: جدول واقعی با سربرگ چسبان تا هنگام اسکرول ستون‌ها گم نشوند.
 * موبایل: هر رکورد یک کارت برچسب‌دار می‌شود — جدول افقیِ کشویی روی موبایل
 * عملاً غیرقابل استفاده است.
 */
export function AdminDataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "موردی برای نمایش وجود ندارد.",
  className,
  caption,
}: AdminDataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "border border-border bg-card p-10 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  const visibleMobileColumns = columns.filter((c) => !c.hideOnMobile);
  const primaryColumn = visibleMobileColumns[0] ?? columns[0];

  return (
    <div className={cn("border border-border bg-card", className)}>
      <div className="hidden md:block">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <thead className="sticky top-0 z-10">
              <tr className="bg-card-elevated">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "border-b border-border px-4 py-2.5 text-start text-[0.6875rem] font-semibold text-muted-foreground",
                      col.className,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/60 transition-colors duration-fast last:border-b-0 hover:bg-accent/40"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3 align-middle", col.className)}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="divide-y divide-border md:hidden" aria-label={caption}>
        {data.map((row) => (
          <li key={row.id} className="flex flex-col gap-2.5 p-4">
            <div className="text-sm font-semibold text-foreground">
              {primaryColumn.render(row)}
            </div>
            {columns
              .filter((col) => col.key !== primaryColumn.key)
              .map((col) => (
                <div
                  key={col.key}
                  className={cn(
                    "flex items-center justify-between gap-3 text-[0.8125rem]",
                    col.hideOnMobile && "hidden",
                  )}
                >
                  <span className="shrink-0 text-muted-foreground">{col.header}</span>
                  <span className="min-w-0 text-end text-foreground">{col.render(row)}</span>
                </div>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
