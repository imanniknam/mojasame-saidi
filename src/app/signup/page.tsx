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
      <main className="ds-section flex min-h-[70dvh] items-center pb-24">
        <SignupPanel />
      </main>
    </StoreShell>
  );
}
