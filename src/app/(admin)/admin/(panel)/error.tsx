"use client";

import { useEffect } from "react";
import { AdminErrorState } from "@/components/admin";

/**
 * مرز خطای پنل مدیریت.
 * بدون این، یک قطعی لحظه‌ای دیتابیس کل پنل را با صفحه‌ی سفید از کار می‌انداخت.
 */
export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("admin_panel_error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="space-y-4">
      <AdminErrorState
        title="خطا در بارگذاری این بخش"
        description="دریافت اطلاعات از سرور ناموفق بود. اتصال دیتابیس را بررسی کنید و دوباره تلاش کنید."
        onRetry={reset}
      />
      {error.digest ? (
        <p dir="ltr" className="text-center text-[0.6875rem] text-muted-foreground/60">
          ref: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
