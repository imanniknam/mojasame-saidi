import { Suspense } from "react";
import { StoreShell } from "@/components/layout/store-shell";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { LoginFlow } from "@/app/login/login-flow";

export const metadata = buildPageMetadata({
  title: "ورود به حساب کاربری",
  description: "ورود امن مشتریان فروشگاه مجسمه‌سازی سعیدی.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <StoreShell>
      <main className="ds-section flex min-h-[70dvh] items-center pb-24">
        <Suspense
          fallback={
            <p className="mx-auto text-sm text-muted-foreground">در حال بارگذاری...</p>
          }
        >
          <LoginFlow />
        </Suspense>
      </main>
    </StoreShell>
  );
}
