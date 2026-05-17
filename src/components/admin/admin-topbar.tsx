"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Store } from "lucide-react";
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

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-[3.75rem] items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/65 sm:px-6",
        className,
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={onOpenMenu}
        aria-label="باز کردن منو"
      >
        <Menu className="size-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-foreground">{current.label}</p>
        {current.description ? (
          <p className="truncate text-xs text-muted-foreground">{current.description}</p>
        ) : null}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="max-w-[12rem] gap-2 truncate">
            <span className="truncate">{userLabel}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-semibold">{userLabel}</p>
            {userEmail ? (
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/" className="cursor-pointer gap-2">
              <Store className="size-4" />
              مشاهده فروشگاه
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/logout" className="cursor-pointer gap-2 text-destructive focus:text-destructive">
              <LogOut className="size-4" />
              خروج از حساب
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
