import { LoginPanel } from "@/components/auth/login-panel";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "ورود به حساب کاربری",
  description: "ورود امن مشتریان فروشگاه مجسمه‌سازی سعیدی.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <main className="ds-section flex min-h-dvh items-center pb-24">
      <LoginPanel mode="customer" />
    </main>
  );
}
