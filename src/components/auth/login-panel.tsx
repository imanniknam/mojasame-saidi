"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/layout/brand-mark";
import { readAuthResponse } from "@/lib/auth/client";
import { useSession, notifySessionChanged } from "@/hooks/use-session";
import { normalizeDigits } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

type LoginMode = "customer" | "admin";

type LoginPanelProps = {
  mode?: LoginMode;
  className?: string;
};

const contentByMode = {
  customer: {
    eyebrow: "Account",
    title: "ورود به حساب",
    description: "برای مشاهده سفارش‌ها، علاقه‌مندی‌ها و ادامه خرید وارد شوید.",
    submitLabel: "ورود",
  },
  admin: {
    eyebrow: "Admin",
    title: "ورود مدیر",
    description: "دسترسی فقط برای مدیران تأییدشده فعال است.",
    submitLabel: "ورود به پنل مدیریت",
  },
} satisfies Record<LoginMode, Record<string, string>>;

type LoginSuccessPayload = {
  redirectTo?: string;
  user?: {
    displayName: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
  };
};

export function LoginPanel({ mode = "customer", className }: LoginPanelProps) {
  const { setUser } = useSession();
  const copy = contentByMode[mode];

  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("loggedOut") === "1") {
      setMessage("خروج از حساب با موفقیت انجام شد.");
    }
  }, []);

  /** ارقام فارسی/عربی همان‌جا به لاتین تبدیل می‌شوند تا کاربر ببیند چه ثبت شده */
  function onPhoneChange(raw: string) {
    setPhone(normalizeDigits(raw).replace(/[^\d]/g, "").slice(0, 11));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!/^09\d{9}$/.test(phone)) {
      setError("شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const next =
      typeof window === "undefined"
        ? undefined
        : new URLSearchParams(window.location.search).get("next") ?? undefined;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          password: String(formData.get("password") ?? ""),
          mode,
          remember: formData.get("remember") === "on",
          next,
        }),
      });

      const result = await readAuthResponse<LoginSuccessPayload>(response);

      if (!response.ok || !result.ok) {
        setError(
          !result.ok && result.error?.message
            ? result.error.message
            : "ورود با خطا روبه‌رو شد.",
        );
        return;
      }

      const redirectTo =
        "redirectTo" in result && result.redirectTo
          ? result.redirectTo
          : mode === "admin"
            ? "/admin"
            : "/";

      if ("user" in result && result.user) {
        setUser({
          name: result.user.displayName,
          email: result.user.email,
          role: result.user.role,
        });
      }

      setMessage("ورود موفق بود. در حال انتقال…");
      notifySessionChanged();

      /**
       * ناوبری کامل مرورگر، نه router.replace/refresh.
       *
       * اگر کاربر قبل از ورود، لینک «حساب کاربری» را در هدر دیده باشد،
       * Next.js آن مسیر را از قبل با محتوای «مهمان» پیش‌بارگذاری کرده — که
       * همان ریدایرکت به لاگین در آن ذخیره شده. router.refresh() فقط صفحه‌ی
       * فعلی را تازه می‌کند، نه کشِ پیش‌بارگذاریِ صفحات دیگر؛ نتیجه این بود که
       * کاربر با موفقیت وارد می‌شد ولی کلیک روی «حساب کاربری»/«سفارش‌های من»
       * دوباره به لاگین برمی‌گشت. window.location یک درخواست کاملاً تازه به
       * سرور می‌زند و این کش را کامل دور می‌زند.
       */
      window.location.href = redirectTo;
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={cn("mx-auto w-full max-w-sm", className)}>
      <div className="flex flex-col items-center text-center">
        <Link href="/" aria-label="صفحه اصلی">
          <BrandMark orientation="vertical" />
        </Link>

        <p className="ds-overline mt-8">{copy.eyebrow}</p>
        <h1 className="ds-title mt-2 text-foreground">{copy.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {copy.description}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 flex flex-col gap-4 border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${mode}-login-phone`}>شماره موبایل</Label>
          <div className="relative">
            <Smartphone
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 stroke-[1.6] text-muted-foreground"
              aria-hidden
            />
            <Input
              id={`${mode}-login-phone`}
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              dir="ltr"
              placeholder="09123456789"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              aria-invalid={error != null || undefined}
              className="h-12 border-border bg-background pe-10 text-start font-mono tracking-wide"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`${mode}-login-password`}>رمز عبور</Label>
            <Link
              href="/login?forgot=1"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              فراموشی رمز؟
            </Link>
          </div>
          <div className="relative">
            <Input
              id={`${mode}-login-password`}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              dir="ltr"
              placeholder="••••••••"
              className="h-12 border-border bg-background ps-11 text-start"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute start-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
              aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="size-[1.15rem] stroke-[1.6]" aria-hidden />
              ) : (
                <Eye className="size-[1.15rem] stroke-[1.6]" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {mode === "customer" ? (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="remember"
              className="size-4 shrink-0 accent-[hsl(var(--primary))]"
            />
            مرا در این دستگاه به خاطر بسپار
          </label>
        ) : null}

        {message ? (
          <p role="status" aria-live="polite" className="text-sm text-primary">
            {message}
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="luxury"
          size="touch"
          className="mt-1 w-full gap-2"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {submitting ? "در حال بررسی…" : copy.submitLabel}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {mode === "customer" ? (
          <p className="text-muted-foreground">
            حساب ندارید؟{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              ثبت‌نام
            </Link>
          </p>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 stroke-[1.6]" aria-hidden />
            ورود مدیران ثبت و پایش می‌شود
          </p>
        )}
      </div>

      {mode === "customer" ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">
            بازگشت به فروشگاه
          </Link>
        </p>
      ) : null}
    </section>
  );
}
