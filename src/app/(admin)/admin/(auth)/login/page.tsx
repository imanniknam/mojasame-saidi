import { LoginPanel } from "@/components/auth/login-panel";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "ورود امن مدیر",
  description: "ورود مدیران فروشگاه مجسمه‌سازی سعیدی.",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <main className="ds-section flex min-h-dvh items-center pb-24">
      <LoginPanel mode="admin" />
    </main>
  );
}
