"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readAuthResponse } from "@/lib/auth/client";
import { useSession, notifySessionChanged } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

type SignupPanelProps = {
  className?: string;
};

type SignupSuccessPayload = {
  redirectTo?: string;
  user?: {
    displayName: string;
    email: string;
    role: "CUSTOMER";
  };
};

export function SignupPanel({ className }: SignupPanelProps) {
  const router = useRouter();
  const { setUser, refresh } = useSession();
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    if (formData.get("terms") !== "on") {
      setError("برای ساخت حساب، پذیرش قوانین خرید و حریم خصوصی لازم است.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });

      const result = await readAuthResponse<SignupSuccessPayload>(response);

      if (!response.ok || !result.ok) {
        setError(
          !result.ok && result.error?.message
            ? result.error.message
            : "ثبت‌نام با خطا روبه‌رو شد.",
        );
        return;
      }

      if ("user" in result && result.user) {
        setUser({
          name: result.user.displayName,
          email: result.user.email,
          role: result.user.role,
        });
      }

      setMessage("حساب شما ساخته شد. در حال انتقال...");
      notifySessionChanged();
      await refresh();
      router.replace(result.redirectTo ?? "/");
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
        "relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-highlight/15 bg-card/70 shadow-float backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,hsl(var(--highlight)/0.18),transparent_18rem)]"
        aria-hidden
      />

      <Card className="relative border-0 bg-transparent p-5 shadow-none sm:p-8 lg:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-xl text-sm font-semibold text-muted-foreground transition-colors hover:text-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            بازگشت به فروشگاه
          </Link>
          <div className="flex size-12 items-center justify-center rounded-2xl border border-highlight/20 bg-highlight/10 text-highlight shadow-elegant">
            <UserPlus className="size-6" aria-hidden />
          </div>
        </div>

        <div className="mb-8 space-y-3 text-start">
          <div className="flex items-center gap-2">
            <span className="h-px w-9 bg-highlight/70" />
            <p className="ds-overline text-highlight">ثبت‌نام مشتری</p>
          </div>
          <h1 className="ds-display text-3xl text-foreground sm:text-4xl">
            ساخت حساب کاربری
          </h1>
          <p className="ds-body max-w-xl text-muted-foreground">
            برای پیگیری سفارش‌ها، ذخیره علاقه‌مندی‌ها و خرید سریع‌تر حساب خود را بسازید.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2 text-start">
            <Label htmlFor="signup-name">نام و نام خانوادگی</Label>
            <div className="relative">
              <UserRound
                className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="مثلاً سارا احمدی"
                className="h-[3.25rem] rounded-2xl border-highlight/15 bg-background/55 pe-12"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 text-start">
              <Label htmlFor="signup-phone">شماره موبایل</Label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="09123456789"
                  dir="ltr"
                  className="h-[3.25rem] rounded-2xl border-highlight/15 bg-background/55 pe-12 text-left"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-start">
              <Label htmlFor="signup-email">ایمیل</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="sara@example.com"
                  dir="ltr"
                  className="h-[3.25rem] rounded-2xl border-highlight/15 bg-background/55 pe-12 text-left"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-start">
            <Label htmlFor="signup-password">رمز عبور</Label>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="حداقل ۸ کاراکتر"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
            <div className="grid grid-cols-4 gap-1" aria-hidden>
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full bg-muted",
                    index < passwordScore && "bg-highlight shadow-[0_0_12px_hsl(var(--highlight)/0.35)]",
                  )}
                />
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/35 p-3 text-sm leading-7 text-muted-foreground">
            <input
              type="checkbox"
              name="terms"
              className="mt-1 size-4 rounded border-border bg-background accent-[hsl(var(--highlight))]"
              required
            />
            <span>
              قوانین خرید، حریم خصوصی و ارسال امن آثار هنری را می‌پذیرم.
            </span>
          </label>

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
            {submitting ? "در حال ساخت حساب..." : "ایجاد حساب کاربری"}
          </Button>
        </form>

        <div className="mt-7 flex flex-col gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>قبلاً حساب ساخته‌اید؟</span>
          <Link href="/login" className="font-semibold text-highlight hover:underline">
            ورود به حساب
          </Link>
        </div>
      </Card>

      <div className="relative hidden min-h-[38rem] overflow-hidden border-s border-border/60 bg-background/70 lg:block">
        <div className="absolute inset-8 rounded-[1.5rem] border border-highlight/15 bg-[url('/images/placeholder-product.svg')] bg-cover bg-center opacity-90 shadow-card" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-8 right-8 left-8 rounded-3xl border border-highlight/20 bg-background/75 p-5 shadow-elegant backdrop-blur-md">
          <Badge variant="highlight" className="mb-4 border border-highlight/30">
            حساب امن
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">عضویت در گالری سعیدی</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
            {["پیگیری سفارش‌ها", "ذخیره علاقه‌مندی‌ها", "خرید سریع‌تر"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-highlight" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
