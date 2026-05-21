"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readAuthResponse } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

type ResetPasswordPanelProps = {
  className?: string;
};

type ResetSuccessPayload = {
  message?: string;
  redirectTo?: string;
};

export function ResetPasswordPanel({ className }: ResetPasswordPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Za-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      setTokenValid(false);
      return;
    }

    let cancelled = false;

    async function validate() {
      try {
        const response = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        const result = await readAuthResponse<{ valid?: boolean }>(response);
        if (!cancelled) {
          setTokenValid(Boolean(response.ok && result.ok && "valid" in result && result.valid));
        }
      } catch {
        if (!cancelled) setTokenValid(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void validate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: String(formData.get("password") ?? ""),
          confirmPassword: String(formData.get("confirmPassword") ?? ""),
        }),
      });

      const result = await readAuthResponse<ResetSuccessPayload>(response);

      if (!response.ok || !result.ok) {
        setError(
          !result.ok && result.error?.message
            ? result.error.message
            : "تغییر رمز با خطا روبه‌رو شد.",
        );
        return;
      }

      setMessage(result.message ?? "رمز عبور با موفقیت تغییر کرد.");
      const redirectTo =
        "redirectTo" in result && result.redirectTo ? result.redirectTo : "/login";

      window.setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 1200);
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <InvalidResetCard
        className={className}
        message="لینک بازیابی نامعتبر است. از صفحه فراموشی رمز دوباره درخواست دهید."
      />
    );
  }

  if (checking) {
    return (
      <section className={cn("mx-auto w-full max-w-md", className)}>
        <Card elevated className="border-highlight/15 p-8 text-center shadow-elegant">
          <p className="text-sm text-muted-foreground">در حال بررسی لینک...</p>
        </Card>
      </section>
    );
  }

  if (!tokenValid) {
    return (
      <InvalidResetCard
        className={className}
        message="این لینک منقضی شده یا قبلاً استفاده شده است."
      />
    );
  }

  return (
    <section className={cn("mx-auto w-full max-w-md", className)}>
      <Card elevated className="border-highlight/15 p-6 shadow-elegant sm:p-8">
        <div className="mb-6 space-y-3 text-start">
          <Badge variant="luxury" className="rounded-full px-3 py-1">
            رمز جدید
          </Badge>
          <div className="space-y-2">
            <p className="ds-overline text-highlight">حساب کاربری</p>
            <h1 className="ds-title text-2xl">تنظیم رمز عبور جدید</h1>
            <p className="ds-subtitle text-sm leading-7">
              رمز جدید را وارد کنید؛ پس از ذخیره می‌توانید با آن وارد شوید.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-start">
            <Label htmlFor="reset-password">رمز عبور جدید</Label>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="reset-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="h-[3.25rem] rounded-2xl border-highlight/15 bg-background/55 pe-12 ps-12 text-left"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute start-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-highlight"
                aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden />
                ) : (
                  <Eye className="size-5" aria-hidden />
                )}
              </button>
            </div>
            <div className="flex gap-1 pt-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full bg-muted/60 transition-colors",
                    index < passwordScore && "bg-highlight shadow-[0_0_12px_hsl(var(--highlight)/0.35)]",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 text-start">
            <Label htmlFor="reset-confirm">تکرار رمز عبور</Label>
            <Input
              id="reset-confirm"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              dir="ltr"
              className="h-[3.25rem] rounded-2xl border-highlight/15 bg-background/55 text-left"
              required
              minLength={8}
            />
          </div>

          {message ? (
            <div
              className="rounded-2xl border border-highlight/20 bg-highlight/10 p-3 text-sm leading-7 text-highlight"
              role="status"
            >
              {message}
            </div>
          ) : null}

          {error ? (
            <div
              className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm leading-7 text-red-200"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            variant="luxury"
            size="touch"
            className="w-full"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "در حال ذخیره..." : "ذخیره رمز جدید"}
          </Button>
        </form>
      </Card>
    </section>
  );
}

function InvalidResetCard({
  className,
  message,
}: {
  className?: string;
  message: string;
}) {
  return (
    <section className={cn("mx-auto w-full max-w-md", className)}>
      <Card elevated className="space-y-4 border-highlight/15 p-6 text-center shadow-elegant sm:p-8">
        <p className="text-sm leading-7 text-muted-foreground">{message}</p>
        <Button variant="luxury" size="touch" asChild>
          <Link href="/login/forgot">درخواست لینک جدید</Link>
        </Button>
        <p className="text-sm">
          <Link href="/login" className="font-semibold text-highlight hover:underline">
            بازگشت به ورود
          </Link>
        </p>
      </Card>
    </section>
  );
}
