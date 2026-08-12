"use client";

import { useCallback, useState, type ComponentPropsWithRef } from "react";
import { notifySessionChanged } from "@/hooks/use-session";

/**
 * خروج با POST، نه لینک.
 *
 * خروج یک عمل تغییردهنده است؛ اگر GET باشد Next آن را مثل هر لینک دیگری
 * prefetch می‌کند و همان درخواست، کوکی سشن را پاک می‌کند — یعنی کاربر فقط با
 * باز کردن منو از حساب خارج می‌شود. شرح کامل در `src/app/logout/route.ts`.
 */
export function useLogout({
  next,
  action = "/logout",
}: { next?: string; action?: "/logout" | "/admin/logout" } = {}) {
  const [submitting, setSubmitting] = useState(false);

  const logout = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const body = new FormData();
      if (next) body.set("next", next);
      // redirect: "manual" — کوکی پاک‌شده اعمال می‌شود ولی بدنه‌ی صفحه‌ی مقصد
      // بی‌جهت دانلود نمی‌شود؛ ناوبری را خودمان انجام می‌دهیم.
      await fetch(action, { method: "POST", body, credentials: "include", redirect: "manual" });
    } catch {
      // قطعی شبکه نباید کاربر را در حالت نامعلوم رها کند — به صفحه‌ی ورود
      // می‌رویم و رفرش بعدی وضعیت واقعی سشن را نشان می‌دهد.
    }

    notifySessionChanged();
    window.location.href = next ?? "/login?loggedOut=1";
  }, [action, next, submitting]);

  return { logout, submitting };
}

type LogoutButtonProps = ComponentPropsWithRef<"button"> & {
  /** مسیر بعد از خروج — پیش‌فرض صفحه‌ی ورود فروشگاه */
  next?: string;
  /** route‌ای که خروج را انجام می‌دهد */
  action?: "/logout" | "/admin/logout";
  onLoggedOut?: () => void;
};

export function LogoutButton({
  next,
  action = "/logout",
  onLoggedOut,
  onClick,
  ...props
}: LogoutButtonProps) {
  const { logout } = useLogout({ next, action });

  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        onLoggedOut?.();
        void logout();
      }}
    />
  );
}
