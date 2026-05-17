import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  children,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="ds-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {children}
        {actionLabel && actionHref ? (
          <Button variant="luxury" size="touch" className="gap-2" asChild>
            <Link href={actionHref}>
              <Plus className="size-4" />
              {actionLabel}
            </Link>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
