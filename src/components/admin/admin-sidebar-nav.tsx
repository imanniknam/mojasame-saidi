"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavGroups } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

export type AdminSidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebarNav({ onNavigate, className }: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-6 p-3", className)} aria-label="منوی مدیریت">
      {adminNavGroups.map((group) => (
        <div key={group.titleFa}>
          <p className="px-3 pb-2 text-[0.6875rem] font-semibold text-muted-foreground/70">
            {group.titleFa}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = item.match?.(pathname) ?? pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      // خط طلایی در ابتدای سطر (راست در RTL) به‌جای پس‌زمینه‌ی پررنگ
                      "relative flex min-h-touch items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors duration-fast",
                      "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full before:transition-colors",
                      active
                        ? "bg-accent font-semibold text-foreground before:bg-primary"
                        : "text-muted-foreground before:bg-transparent hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[1.15rem] shrink-0 stroke-[1.6]",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                      aria-hidden
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
