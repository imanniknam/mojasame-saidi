import { ForgotPasswordPanel } from "@/components/auth/forgot-password-panel";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "فراموشی رمز عبور",
  description: "بازیابی رمز عبور حساب کاربری فروشگاه مجسمه‌سازی سعیدی.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <main className="ds-section flex min-h-dvh items-center pb-24">
      <ForgotPasswordPanel />
    </main>
  );
}
