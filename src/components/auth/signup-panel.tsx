"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Mail, Smartphone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/layout/brand-mark";
import { readAuthResponse } from "@/lib/auth/client";
import { useSession, notifySessionChanged } from "@/hooks/use-session";
import { normalizeDigits } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

type SignupPanelProps = {
  className?: string;
};

type SignupSuccessPayload = {
  redirectTo?: string;
  user?: {
    displayName: string;
    email: string | null;
    role: "CUSTOMER";
  };
};

const STRENGTH_LABELS = ["خیلی ضعیف", "ضعیف", "متوسط", "خوب", "قوی"] as const;

export function SignupPanel({ className }: SignupPanelProps) {
  const router = useRouter();
  const { setUser, refresh } = useSession();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

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

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          phone,
          email: String(formData.get("email") ?? "").trim(),
          password,
        }),
      });

      const result = await readAuthResponse<SignupSuccessPayload>(response);

      if (!response.ok || !result.ok) {
        setError(
          !result.ok && result.error?.message
            ? result.error.message
            : "ساخت حساب با خطا روبه‌رو شد.",
        );
        return;
      }

      if ("user" in result && result.user) {
        setUser({
          name: result.user.displayName,
          email: result.user.email ?? undefined,
          role: result.user.role,
        });
      }

      setMessage("حساب شما ساخته شد. در حال انتقال…");
      notifySessionChanged();
      await refresh();
      router.replace(
        "redirectTo" in result && result.redirectTo ? result.redirectTo : "/",
      );
      router.refresh();
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

        <p className="ds-overline mt-8">Register</p>
        <h1 className="ds-title mt-2 text-foreground">ساخت حساب</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          با شماره موبایل ثبت‌نام کنید. ایمیل اختیاری است.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 flex flex-col gap-4 border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-name">نام و نام خانوادگی</Label>
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 stroke-[1.6] text-muted-foreground"
              aria-hidden
            />
            <Input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="مثلاً سارا احمدی"
              className="h-12 border-border bg-background pe-10"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-phone">شماره موبایل</Label>
          <div className="relative">
            <Smartphone
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 stroke-[1.6] text-muted-foreground"
              aria-hidden
            />
            <Input
              id="signup-phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              dir="ltr"
              placeholder="09123456789"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="h-12 border-border bg-background pe-10 text-start font-mono tracking-wide"
              required
            />
          </div>
          <p className="text-[0.6875rem] text-muted-foreground">
            برای ورود به حساب از همین شماره استفاده می‌کنید.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="signup-email">ایمیل</Label>
            <span className="text-[0.6875rem] text-muted-foreground">اختیاری</span>
          </div>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 stroke-[1.6] text-muted-foreground"
              aria-hidden
            />
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              placeholder="sara@example.com"
              className="h-12 border-border bg-background pe-10 text-start"
              aria-describedby="email-hint"
            />
          </div>
          <p id="email-hint" className="text-[0.6875rem] text-muted-foreground">
            اگر ایمیل ندهید، در صورت فراموشی رمز باید با پشتیبانی تماس بگیرید.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-password">رمز عبور</Label>
          <div className="relative">
            <Input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              dir="ltr"
              placeholder="حداقل ۸ کاراکتر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-border bg-background ps-11 text-start"
              required
              minLength={8}
              aria-describedby="password-strength"
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

          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1" aria-hidden>
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1 flex-1 transition-colors duration-fast",
                    index < passwordScore ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>
            {/* متن هم می‌آید، چون نوار رنگی به‌تنهایی برای کاربر کم‌بینا پیام ندارد */}
            <span
              id="password-strength"
              aria-live="polite"
              className="w-16 text-[0.6875rem] text-muted-foreground"
            >
              {password ? STRENGTH_LABELS[passwordScore] : ""}
            </span>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            name="terms"
            className="mt-1 size-4 shrink-0 accent-[hsl(var(--primary))]"
            required
          />
          <span>قوانین خرید و حریم خصوصی را می‌پذیرم.</span>
        </label>

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
          {submitting ? "در حال ساخت حساب…" : "ایجاد حساب"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        قبلاً حساب ساخته‌اید؟{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          ورود
        </Link>
      </p>
    </section>
  );
}
