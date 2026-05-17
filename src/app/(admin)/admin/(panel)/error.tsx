"use client";

import { AdminErrorState } from "@/components/admin";

export default function AdminPanelError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AdminErrorState
      title="خطا در پنل مدیریت"
      description="بارگذاری این بخش با مشکل مواجه شد. در صورت تکرار، اتصال پایگاه‌داده و ورود مدیر را بررسی کنید."
      onRetry={reset}
    />
  );
}
