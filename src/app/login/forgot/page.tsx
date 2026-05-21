import { ForgotPasswordPanel } from "@/components/auth/forgot-password-panel";
import { StoreShell } from "@/components/layout/store-shell";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "فراموشی رمز عبور",
  description: "بازیابی رمز عبور حساب کاربری فروشگاه مجسمه‌سازی سعیدی.",
  path: "/login/forgot",
  noIndex: true,
});

export default function LoginForgotPasswordPage() {
  return (
    <StoreShell>
      <main className="ds-section flex min-h-[70dvh] items-center pb-24">
        <ForgotPasswordPanel />
      </main>
    </StoreShell>
  );
}
