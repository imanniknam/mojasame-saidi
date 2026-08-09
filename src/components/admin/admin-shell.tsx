"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { BrandMark } from "@/components/layout/brand-mark";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export type AdminShellProps = {
  children: ReactNode;
  userLabel?: string;
  userEmail?: string;
};

export function AdminShell({ children, userLabel, userEmail }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    /* admin-scope پالت خنثای پنل را فعال می‌کند — تعریفش در globals.css است */
    <div className="admin-scope flex min-h-dvh bg-background text-foreground">
      <div className="hidden lg:flex">
        <AdminSidebar className="sticky top-0 h-dvh" />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="admin-scope w-[min(100vw,17rem)] border-s border-border bg-card p-0"
        >
          <SheetTitle className="sr-only">منوی مدیریت</SheetTitle>
          <div className="border-b border-border p-4">
            <BrandMark orientation="horizontal" />
            <p className="mt-2 text-[0.6875rem] text-muted-foreground">پنل مدیریت</p>
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
        <main className="mx-auto w-full max-w-[80rem] flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
