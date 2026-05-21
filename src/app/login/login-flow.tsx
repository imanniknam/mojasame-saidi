"use client";

import { useSearchParams } from "next/navigation";
import { ForgotPasswordPanel } from "@/components/auth/forgot-password-panel";
import { LoginPanel } from "@/components/auth/login-panel";
import { ResetPasswordPanel } from "@/components/auth/reset-password-panel";

/** همهٔ جریان‌های ورود/بازیابی رمز روی /login — بدون route جدا (سازگار با deploy فعلی). */
export function LoginFlow() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim();
  const forgot =
    searchParams.get("forgot") === "1" ||
    searchParams.has("forgot") ||
    searchParams.get("mode") === "forgot";

  if (token) {
    return <ResetPasswordPanel />;
  }

  if (forgot) {
    return <ForgotPasswordPanel />;
  }

  return <LoginPanel mode="customer" />;
}
