"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { KeyRound, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestForgotPasswordAction } from "@/lib/auth/forgot-password-action";
import { cn } from "@/lib/utils";

type ForgotPasswordPanelProps = {
  className?: string;
};

export function ForgotPasswordPanel({ className }: ForgotPasswordPanelProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setDevResetUrl(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await requestForgotPasswordAction(String(formData.get("email") ?? ""));

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setMessage(result.message);

      if ("devResetUrl" in result && result.devResetUrl) {
        setDevResetUrl(result.devResetUrl);
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={cn("mx-auto w-full max-w-md", className)}>
      <Card elevated className="border-highlight/15 p-6 shadow-elegant sm:p-8">
        <div className="mb-6 space-y-3 text-start">
          <Badge variant="luxury" className="rounded-full px-3 py-1">
            بازیابی رمز
          </Badge>
          <div className="space-y-2">
            <p className="ds-overline text-highlight">حساب کاربری</p>
            <h1 className="ds-title text-2xl">فراموشی رمز عبور</h1>
            <p className="ds-subtitle text-sm leading-7">
              ایمیل ثبت‌شده در حساب خود را وارد کنید. لینک تنظیم رمز جدید برای شما ارسال
              می‌شود.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-start">
            <Label htmlFor="forgot-email">ایمیل</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="email@example.com"
                dir="ltr"
                className="h-[3.25rem] rounded-2xl border-highlight/15 bg-background/55 pe-12 text-left"
                required
              />
            </div>
          </div>

          {message ? (
            <div
              className="rounded-2xl border border-highlight/20 bg-highlight/10 p-3 text-sm leading-7 text-highlight"
              role="status"
            >
              {message}
              {devResetUrl ? (
                <p className="mt-3 break-all text-xs text-foreground" dir="ltr">
                  <span className="block text-muted-foreground mb-1">(حالت توسعه — ایمیل ارسال نشده)</span>
                  <Link href={devResetUrl} className="font-semibold text-highlight hover:underline">
                    {devResetUrl}
                  </Link>
                </p>
              ) : null}
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
            className="w-full gap-2"
            disabled={submitting}
            aria-busy={submitting}
          >
            <KeyRound className="size-5" aria-hidden />
            {submitting ? "در حال ارسال..." : "ارسال لینک بازیابی"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-semibold text-highlight hover:underline"
          >
            بازگشت به ورود
          </Link>
        </p>
      </Card>
    </section>
  );
}
