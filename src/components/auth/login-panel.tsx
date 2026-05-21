"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readAuthResponse } from "@/lib/auth/client";
import { useSession, notifySessionChanged } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

type LoginMode = "customer" | "admin";

type LoginPanelProps = {
  mode?: LoginMode;
  className?: string;
};

const contentByMode = {
  customer: {
    eyebrow: "ورود مشتری",
    title: "ورود به حساب کاربری",
    description:
      "برای مشاهده سفارش‌ها، علاقه‌مندی‌ها و ادامه خرید وارد حساب خود شوید.",
    emailLabel: "ایمیل یا شماره موبایل",
    emailPlaceholder: "مثلاً sara@example.com",
    submitLabel: "ورود به فروشگاه",
    badge: "حساب امن",
    switchHref: "/signup",
    switchLabel: "ایجاد حساب جدید",
  },
  admin: {
    eyebrow: "پنل مدیریت",
    title: "ورود امن مدیر",
    description:
      "دسترسی مدیریت فقط برای ادمین‌های تاییدشده فروشگاه مجسمه‌سازی سعیدی فعال می‌شود.",
    emailLabel: "ایمیل مدیر",
    emailPlaceholder: "admin@mojasamesaidi.ir",
    submitLabel: "ورود به پنل مدیریت",
    badge: "Admin Only",
    switchHref: "/login",
    switchLabel: "ورود مشتری",
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
  const router = useRouter();
  const { setUser, refresh } = useSession();
  const copy = contentByMode[mode];
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("loggedOut") === "1") {
      setMessage("خروج از حساب با موفقیت انجام شد.");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
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
          identifier: String(formData.get("identifier") ?? ""),
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

      setMessage("ورود موفق بود. در حال انتقال...");
      notifySessionChanged();
      await refresh();
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className={cn(
        "relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-highlight/15 bg-card/70 shadow-float backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--highlight)/0.18),transparent_18rem)]"
        aria-hidden
      />

      <div className="relative hidden min-h-[36rem] overflow-hidden border-e border-border/60 bg-background/70 lg:block">
        <div className="absolute inset-8 rounded-[1.5rem] border border-highlight/15 bg-[url('/images/placeholder-product.svg')] bg-cover bg-center opacity-90 shadow-card" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
        <div className="absolute bottom-8 right-8 left-8 rounded-3xl border border-highlight/20 bg-background/75 p-5 shadow-elegant backdrop-blur-md">
          <Badge variant="highlight" className="mb-4 border border-highlight/30">
            {copy.badge}
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">گالری خصوصی سعیدی</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            تجربه‌ای مینیمال، امن و لوکس برای مدیریت خریدها و آثار هنری فروشگاه.
          </p>
        </div>
      </div>

      <Card className="relative border-0 bg-transparent p-5 shadow-none sm:p-8 lg:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-xl text-sm font-semibold text-muted-foreground transition-colors hover:text-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            بازگشت به فروشگاه
          </Link>
          <div className="flex size-12 items-center justify-center rounded-2xl border border-highlight/20 bg-highlight/10 text-highlight shadow-elegant">
            {mode === "admin" ? (
              <ShieldCheck className="size-6" aria-hidden />
            ) : (
              <LockKeyhole className="size-6" aria-hidden />
            )}
          </div>
        </div>

        <div className="mb-8 space-y-3 text-start">
          <div className="flex items-center gap-2">
            <span className="h-px w-9 bg-highlight/70" />
            <p className="ds-overline text-highlight">{copy.eyebrow}</p>
          </div>
          <h1 className="ds-display text-3xl text-foreground sm:text-4xl">
            {copy.title}
          </h1>
          <p className="ds-body max-w-xl text-muted-foreground">{copy.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2 text-start">
            <Label htmlFor={`${mode}-login-email`}>{copy.emailLabel}</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id={`${mode}-login-email`}
                name="identifier"
                type={mode === "admin" ? "email" : "text"}
                autoComplete={mode === "admin" ? "username" : "email"}
                placeholder={copy.emailPlaceholder}
                dir="ltr"
                className="h-[3.25rem] rounded-2xl border-highlight/15 bg-background/55 pe-12 text-left"
                required
              />
            </div>
          </div>

          <div className="space-y-2 text-start">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`${mode}-login-password`}>رمز عبور</Label>
              {mode === "customer" ? (
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-highlight hover:underline"
                >
                  فراموشی رمز؟
                </Link>
              ) : (
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-highlight hover:underline"
                >
                  بازیابی رمز مدیر
                </Link>
              )}
            </div>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id={`${mode}-login-password`}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="رمز عبور"
                dir="ltr"
                className="h-[3.25rem] rounded-2xl border-highlight/15 bg-background/55 pe-12 ps-12 text-left"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute start-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-highlight"
                aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden />
                ) : (
                  <Eye className="size-5" aria-hidden />
                )}
              </button>
            </div>
          </div>

          {mode === "customer" ? (
            <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/35 p-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="remember"
                className="size-4 rounded border-border bg-background accent-[hsl(var(--highlight))]"
              />
              مرا در این دستگاه به خاطر بسپار
            </label>
          ) : null}

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
            {submitting ? "در حال بررسی..." : copy.submitLabel}
          </Button>
        </form>

        <div className="mt-7 space-y-4">
          {mode === "customer" ? (
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-start">
              <p className="text-sm font-semibold text-foreground">ورود مدیر فروشگاه</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                برای مدیریت محصولات، سفارش‌ها و تنظیمات از پنل ادمین وارد شوید.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl" asChild>
                <Link href="/admin/login">ورود به پنل مدیریت</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-start">
              <p className="text-sm text-muted-foreground">
                حساب تست مدیر:{" "}
                <span className="font-mono text-foreground" dir="ltr">
                  admin@mojasamesaidi.ir
                </span>
              </p>
            </div>
          )}

        <div className="flex flex-col gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            {mode === "customer" ? "حساب ندارید؟" : "ورود مدیران ثبت و مانیتور می‌شود."}
          </span>
          <Link href={copy.switchHref} className="font-semibold text-highlight hover:underline">
            {copy.switchLabel}
          </Link>
        </div>
        </div>
      </Card>
    </section>
  );
}
