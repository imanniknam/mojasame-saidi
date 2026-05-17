import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminLoadingStateProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export function AdminLoadingState({ rows = 5, columns = 4, className }: AdminLoadingStateProps) {
  return (
    <div className={cn("space-y-4", className)} aria-busy aria-label="در حال بارگذاری">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
          </Card>
        ))}
      </div>
      <Card elevated className="overflow-hidden rounded-2xl p-0">
        <div className="hidden border-b border-border/60 px-4 py-3 md:grid md:grid-cols-[repeat(var(--cols),minmax(0,1fr))] md:gap-4" style={{ ["--cols" as string]: columns }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="flex flex-col gap-3 p-4 md:grid md:grid-cols-[repeat(var(--cols),minmax(0,1fr))] md:items-center md:gap-4" style={{ ["--cols" as string]: columns }}>
              {Array.from({ length: columns }).map((_, col) => (
                <Skeleton key={col} className="h-4 w-full max-w-[12rem]" />
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
