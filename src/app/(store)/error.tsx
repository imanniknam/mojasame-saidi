"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * مرز خطای فروشگاه.
 *
 * برای صفحه‌ی محصول و دسته نمی‌شود مثل صفحه‌ی اصلی بی‌صدا تنزل کرد: اگر کوئری
 * شکست بخورد، نمایش «پیدا نشد» دروغ است و صفحه‌ی سفید بدتر. پس خطا را صادقانه
 * نشان می‌دهیم و راه تلاش دوباره می‌گذاریم.
 */
export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("store_route_error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <main className="ds-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <TriangleAlert className="size-10 stroke-[1.2] text-primary/70" aria-hidden />

      <h1 className="ds-title mt-5 text-foreground">مشکلی پیش آمد</h1>

      <p className="ds-prose mt-3 text-center">
        در دریافت اطلاعات از سرور خطایی رخ داد. اتصال شما مشکلی ندارد — لطفاً یک بار
        دیگر تلاش کنید.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="luxury" size="touch" className="gap-2 px-6" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          تلاش دوباره
        </Button>
        <Button variant="outline" size="touch" className="px-6" asChild>
          <Link href="/">بازگشت به صفحه اصلی</Link>
        </Button>
      </div>

      {error.digest ? (
        <p dir="ltr" className="mt-8 text-[0.6875rem] text-muted-foreground/60">
          ref: {error.digest}
        </p>
      ) : null}
    </main>
  );
}
