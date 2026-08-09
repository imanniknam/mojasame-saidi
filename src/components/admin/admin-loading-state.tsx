import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type AdminLoadingStateProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export function AdminLoadingState({
  rows = 5,
  columns = 4,
  className,
}: AdminLoadingStateProps) {
  const colStyle = { ["--cols" as string]: columns };

  return (
    <div className={cn("space-y-4", className)} aria-busy aria-label="در حال بارگذاری">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border bg-card p-4">
            <Skeleton className="h-3 w-20 rounded-sm" />
            <Skeleton className="mt-3 h-7 w-16 rounded-sm" />
          </div>
        ))}
      </div>

      <div className="border border-border bg-card">
        <div
          className="hidden border-b border-border px-4 py-2.5 md:grid md:grid-cols-[repeat(var(--cols),minmax(0,1fr))] md:gap-4"
          style={colStyle}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-20 rounded-sm" />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, row) => (
            <div
              key={row}
              className="flex flex-col gap-3 p-4 md:grid md:grid-cols-[repeat(var(--cols),minmax(0,1fr))] md:items-center md:gap-4"
              style={colStyle}
            >
              {Array.from({ length: columns }).map((_, col) => (
                <Skeleton key={col} className="h-4 w-full max-w-[12rem] rounded-sm" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
