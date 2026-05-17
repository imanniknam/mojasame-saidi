import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
};

export function AdminStatCard({ label, value, hint, icon: Icon, className }: AdminStatCardProps) {
  return (
    <Card elevated className={cn("rounded-2xl border-border/60", className)}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-highlight/20 bg-highlight/10 text-highlight"
            aria-hidden
          >
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
