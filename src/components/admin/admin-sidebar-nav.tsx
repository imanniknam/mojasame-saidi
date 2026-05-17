"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

export type AdminSidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebarNav({ onNavigate, className }: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)} aria-label="منوی مدیریت">
      {adminNavItems.map((item) => {
        const active = item.match?.(pathname) ?? pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-touch items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border border-highlight/25 bg-highlight/15 text-highlight"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
