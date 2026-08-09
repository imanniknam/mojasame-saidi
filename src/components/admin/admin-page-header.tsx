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
        "flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {children}
        {actionLabel && actionHref ? (
          <Button variant="luxury" size="touch" className="gap-2" asChild>
            <Link href={actionHref}>
              <Plus className="size-4" aria-hidden />
              {actionLabel}
            </Link>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
