"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, Store, UserRound } from "lucide-react";
import { getAdminNavItem } from "@/lib/admin/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type AdminTopbarProps = {
  userLabel?: string;
  userEmail?: string;
  onOpenMenu?: () => void;
  className?: string;
};

export function AdminTopbar({
  userLabel = "مدیر",
  userEmail,
  onOpenMenu,
  className,
}: AdminTopbarProps) {
  const pathname = usePathname();
  const current = getAdminNavItem(pathname);

  const initials = userLabel
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-xl sm:px-6",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-foreground lg:hidden"
        onClick={onOpenMenu}
        aria-label="باز کردن منو"
      >
        <Menu className="size-5 stroke-[1.6]" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{current.label}</p>
        {current.description ? (
          <p className="truncate text-[0.6875rem] text-muted-foreground">
            {current.description}
          </p>
        ) : null}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 shrink-0 gap-2 px-2 text-muted-foreground hover:text-foreground"
            aria-label={`حساب کاربری — ${userLabel}`}
          >
            <span
              aria-hidden
              className="flex size-7 items-center justify-center rounded-sm border border-border bg-accent text-[0.625rem] font-bold text-foreground"
            >
              {initials || <UserRound className="size-3.5" />}
            </span>
            <span className="hidden max-w-[9rem] truncate text-sm sm:inline">
              {userLabel}
            </span>
            <ChevronDown className="size-3.5 opacity-60" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-semibold">{userLabel}</p>
            {userEmail ? (
              <p dir="ltr" className="truncate text-start text-xs text-muted-foreground">
                {userEmail}
              </p>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/" className="cursor-pointer gap-2">
              <Store className="size-4" aria-hidden />
              مشاهده فروشگاه
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href="/admin/logout"
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" aria-hidden />
              خروج از حساب
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
