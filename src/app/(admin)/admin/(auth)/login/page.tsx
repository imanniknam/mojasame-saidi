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
    /* admin-scope تا صفحه‌ی ورود همان پالت پنلی را داشته باشد که به آن وارد می‌شود */
    <main className="admin-scope flex min-h-dvh items-center bg-background px-4 py-16">
      <LoginPanel mode="admin" />
    </main>
  );
}
