import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminEmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: AdminEmptyStateProps) {
  return (
    <Card
      elevated
      className={cn(
        "flex flex-col items-center justify-center rounded-[1.75rem] border border-border/60 bg-card/50 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <div
          className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-highlight/20 bg-highlight/10 text-highlight"
          aria-hidden
        >
          <Icon className="size-7" />
        </div>
      ) : null}
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      {actionLabel && actionHref ? (
        <Button variant="luxury" size="touch" className="mt-6" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <Button variant="luxury" size="touch" className="mt-6" type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
