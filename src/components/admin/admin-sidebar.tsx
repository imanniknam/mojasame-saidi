import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { BrandMark } from "@/components/layout/brand-mark";
import { cn } from "@/lib/utils";

export type AdminSidebarProps = {
  className?: string;
};

export function AdminSidebar({ className }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-s border-border bg-card",
        className,
      )}
    >
      <div className="border-b border-border p-4">
        <Link href="/admin" className="block">
          <BrandMark orientation="horizontal" />
        </Link>
        <p className="mt-2 text-[0.6875rem] text-muted-foreground">پنل مدیریت</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AdminSidebarNav />
      </div>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="group flex min-h-touch items-center gap-2 rounded-sm px-3 text-xs text-muted-foreground transition-colors duration-fast hover:text-primary"
        >
          <ArrowLeft
            className="size-3.5 transition-transform duration-base group-hover:-translate-x-1"
            aria-hidden
          />
          بازگشت به فروشگاه
        </Link>
      </div>
    </aside>
  );
}
