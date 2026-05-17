import Link from "next/link";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { cn } from "@/lib/utils";

export type AdminSidebarProps = {
  className?: string;
};

export function AdminSidebar({ className }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[17.5rem] shrink-0 flex-col border-s border-border/60 bg-card/40 backdrop-blur-md",
        className,
      )}
    >
      <div className="border-b border-border/50 p-5">
        <Link href="/admin" className="block space-y-0.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-highlight">
            پنل مدیریت
          </p>
          <p className="ds-title text-base font-bold leading-snug text-foreground">
            مجسمه‌سازی سعیدی
          </p>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AdminSidebarNav />
      </div>
      <div className="border-t border-border/50 p-4">
        <Link
          href="/"
          className="text-xs text-muted-foreground transition-colors hover:text-highlight"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    </aside>
  );
}
