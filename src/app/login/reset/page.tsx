import { Suspense } from "react";
import { ResetPasswordPanel } from "@/components/auth/reset-password-panel";
import { StoreShell } from "@/components/layout/store-shell";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "تنظیم رمز جدید",
  description: "تنظیم رمز عبور جدید برای حساب فروشگاه مجسمه‌سازی سعیدی.",
  path: "/login/reset",
  noIndex: true,
});

export default function LoginResetPasswordPage() {
  return (
    <StoreShell>
      <main className="ds-section flex min-h-[70dvh] items-center pb-24">
        <Suspense
          fallback={
            <p className="mx-auto text-sm text-muted-foreground">در حال بارگذاری...</p>
          }
        >
          <ResetPasswordPanel />
        </Suspense>
      </main>
    </StoreShell>
  );
}
