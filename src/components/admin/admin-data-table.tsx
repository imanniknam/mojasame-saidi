import type { AdminTableColumn } from "@/lib/admin/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminDataTableProps<T extends { id: string }> = {
  columns: AdminTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  caption?: string;
};

export function AdminDataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "موردی برای نمایش وجود ندارد.",
  className,
  caption,
}: AdminDataTableProps<T>) {
  if (data.length === 0) {
    return (
      <Card elevated className={cn("rounded-2xl p-8 text-center text-sm text-muted-foreground", className)}>
        {emptyMessage}
      </Card>
    );
  }

  const visibleMobileColumns = columns.filter((c) => !c.hideOnMobile);
  const primaryColumn = visibleMobileColumns[0] ?? columns[0];

  return (
    <Card elevated className={cn("overflow-hidden rounded-2xl border-border/60", className)}>
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-start text-xs font-semibold text-muted-foreground",
                      col.className,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-muted/15">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="divide-y divide-border/50 md:hidden" aria-label={caption}>
        {data.map((row) => (
          <li key={row.id} className="flex flex-col gap-3 p-4">
            <div className="font-semibold text-foreground">{primaryColumn.render(row)}</div>
            {columns
              .filter((col) => col.key !== primaryColumn.key)
              .map((col) => (
                <div
                  key={col.key}
                  className={cn(
                    "flex items-center justify-between gap-3 text-sm",
                    col.hideOnMobile && "hidden",
                  )}
                >
                  <span className="text-muted-foreground">{col.header}</span>
                  <span className="text-end font-medium text-foreground">{col.render(row)}</span>
                </div>
              ))}
          </li>
        ))}
      </ul>
    </Card>
  );
}
