import { SignupPanel } from "@/components/auth/signup-panel";
import { StoreShell } from "@/components/layout/store-shell";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "ثبت‌نام مشتری",
  description: "ساخت حساب کاربری در فروشگاه مجسمه‌سازی سعیدی.",
  path: "/signup",
  noIndex: true,
});

export default function SignupPage() {
  return (
    <StoreShell>
      <main className="mb-nav flex min-h-[70dvh] items-center px-4 py-14">
        <SignupPanel />
      </main>
    </StoreShell>
  );
}
