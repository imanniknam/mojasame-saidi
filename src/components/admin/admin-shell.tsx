"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export type AdminShellProps = {
  children: ReactNode;
  userLabel?: string;
  userEmail?: string;
};

export function AdminShell({ children, userLabel, userEmail }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <div className="hidden md:flex">
        <AdminSidebar className="sticky top-0 h-dvh" />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[min(100vw,20rem)] border-s border-border/60 bg-card p-0">
          <SheetTitle className="sr-only">منوی مدیریت</SheetTitle>
          <div className="border-b border-border/50 p-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-highlight">
              پنل مدیریت
            </p>
            <p className="ds-title text-base font-bold text-foreground">مجسمه‌سازی سعیدی</p>
          </div>
          <AdminSidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          userLabel={userLabel}
          userEmail={userEmail}
          onOpenMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
