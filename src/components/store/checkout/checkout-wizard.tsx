"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  checkoutAddressSchema,
  checkoutPaymentSchema,
  checkoutShippingSchema,
  type CheckoutAddress,
  type CheckoutPayment,
  type CheckoutShipping,
} from "@/lib/validations/checkout";
import {
  computeCartTotals,
  getOrderTotalMinor,
  getShippingMinorForMethod,
} from "@/lib/cart/totals";
import { formatPriceFa } from "@/lib/format";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartHydration } from "@/hooks/use-cart-hydration";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mojasame-checkout-draft-v1";

type Step = 1 | 2 | 3 | 4;

type Draft = {
  step: Step;
  address: Partial<CheckoutAddress>;
  shipping: CheckoutShipping | null;
  payment: CheckoutPayment | null;
};

const defaultAddress: Partial<CheckoutAddress> = {
  recipientFa: "",
  phone: "",
  provinceFa: "",
  cityFa: "",
  line1: "",
  plaque: "",
  unit: "",
  postalCode: "",
};

function loadDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
}

function saveDraft(draft: Draft) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "آدرس" },
  { id: 2, label: "ارسال" },
  { id: 3, label: "پرداخت" },
  { id: 4, label: "تأیید" },
];

export function CheckoutWizard() {
  const router = useRouter();
  const ready = useCartHydration();
  const reduceMotion = useReducedMotion();
  const lines = useCartStore((s) => s.lines);
  const discount = useCartStore((s) => s.discount);
  const clear = useCartStore((s) => s.clear);

  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<Partial<CheckoutAddress>>(defaultAddress);
  const [shipping, setShipping] = useState<CheckoutShipping | null>(null);
  const [payment, setPayment] = useState<CheckoutPayment | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const baseTotals = useMemo(
    () => computeCartTotals(lines, discount),
    [lines, discount],
  );

  const afterDiscount = baseTotals.afterDiscountMinor;

  const shippingMinor = shipping
    ? getShippingMinorForMethod(shipping.method, afterDiscount)
    : null;

  const orderTotalMinor =
    shipping != null
      ? getOrderTotalMinor(afterDiscount, shipping.method)
      : afterDiscount + baseTotals.shippingMinor;

  useEffect(() => {
    const d = loadDraft();
    if (d) {
      if (d.step >= 1 && d.step <= 3) setStep(d.step);
      setAddress({ ...defaultAddress, ...d.address });
      setShipping(d.shipping);
      setPayment(d.payment);
    }
  }, []);

  useEffect(() => {
    if (step >= 4) return;
    saveDraft({
      step,
      address,
      shipping,
      payment,
    });
  }, [step, address, shipping, payment]);

  useEffect(() => {
    if (!ready) return;
    if (lines.length === 0 && step < 4) {
      router.replace("/cart?checkout=empty");
    }
  }, [ready, lines.length, router, step]);

  const goNext = useCallback(() => {
    if (step === 1) {
      const r = checkoutAddressSchema.safeParse(address);
      if (!r.success) {
        const fe: Record<string, string> = {};
        for (const iss of r.error.issues) {
          const k = iss.path[0];
          if (typeof k === "string" && !fe[k]) fe[k] = iss.message;
        }
        setFieldErrors(fe);
        toast.error("لطفاً فیلدهای قرمز را اصلاح کنید.");
        return;
      }
      setFieldErrors({});
      setAddress(r.data);
      setStep(2);
      return;
    }
    if (step === 2) {
      const r = checkoutShippingSchema.safeParse(shipping ?? {});
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "روش ارسال را انتخاب کنید.");
        return;
      }
      setShipping(r.data);
      setStep(3);
      return;
    }
    if (step === 3) {
      const r = checkoutPaymentSchema.safeParse(payment ?? {});
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "روش پرداخت را انتخاب کنید.");
        return;
      }
      setPayment(r.data);
      const num = `MS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderNumber(num);
      clearDraft();
      clear();
      setStep(4);
      toast.success("سفارش شما ثبت شد (نمونه)");
    }
  }, [step, address, shipping, payment, clear]);

  const goBack = useCallback(() => {
    if (step <= 1) {
      router.push("/cart");
      return;
    }
    setStep((s) => (s > 1 ? ((s - 1) as Step) : 1));
  }, [router]);

  if (!ready) {
    return (
      <main className="ds-section mx-auto max-w-lg pb-28 text-center text-muted-foreground">
        در حال بارگذاری…
      </main>
    );
  }

  if (lines.length === 0 && step < 4) {
    return (
      <main className="ds-section mx-auto max-w-lg pb-28 text-center text-muted-foreground">
        در حال انتقال به سبد…
      </main>
    );
  }

  const trackingHref = "/orders/track?token=demo";

  return (
    <main className="ds-section relative mx-auto max-w-lg pb-36 md:pb-10">
      <div className="mb-6 text-start">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          تسویه حساب
        </p>
        <h1 className="ds-title mt-1 text-2xl">تکمیل سفارش</h1>
      </div>

      <nav
        aria-label="مراحل تسویه"
        className="mb-6 flex items-center justify-between gap-1 rounded-xl border border-border/70 bg-card/80 p-2 shadow-elegant"
      >
        {STEPS.map((s, i) => {
          const active = step === s.id;
          const done = step > s.id;
          return (
            <div
              key={s.id}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-center text-[0.65rem] font-bold sm:text-xs",
                active && "bg-highlight/15 text-highlight",
                done && !active && "text-emerald-700 dark:text-emerald-400",
                !done && !active && "text-muted-foreground",
              )}
            >
              <span className="tabular-nums">{i + 1}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduceMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 1 ? (
            <Card className="space-y-4 border-border/70 p-4 shadow-elegant sm:p-5">
              <h2 className="text-start text-lg font-bold">آدرس تحویل</h2>
              <div className="space-y-2 text-start">
                <Label htmlFor="recipient">نام و نام خانوادگی گیرنده</Label>
                <Input
                  id="recipient"
                  value={address.recipientFa ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, recipientFa: e.target.value }))
                  }
                  className={cn(fieldErrors.recipientFa && "border-destructive")}
                  placeholder="مثلاً علی رضایی"
                  autoComplete="name"
                />
                {fieldErrors.recipientFa ? (
                  <p className="text-xs text-destructive">{fieldErrors.recipientFa}</p>
                ) : null}
              </div>
              <div className="space-y-2 text-start">
                <Label htmlFor="phone">شماره موبایل</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  value={address.phone ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, phone: e.target.value }))
                  }
                  className={cn(fieldErrors.phone && "border-destructive")}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                  style={{ textAlign: "end" }}
                />
                {fieldErrors.phone ? (
                  <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 text-start">
                  <Label htmlFor="province">استان</Label>
                  <Input
                    id="province"
                    value={address.provinceFa ?? ""}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, provinceFa: e.target.value }))
                    }
                    className={cn(fieldErrors.provinceFa && "border-destructive")}
                    placeholder="تهران"
                  />
                  {fieldErrors.provinceFa ? (
                    <p className="text-xs text-destructive">{fieldErrors.provinceFa}</p>
                  ) : null}
                </div>
                <div className="space-y-2 text-start">
                  <Label htmlFor="city">شهر</Label>
                  <Input
                    id="city"
                    value={address.cityFa ?? ""}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, cityFa: e.target.value }))
                    }
                    className={cn(fieldErrors.cityFa && "border-destructive")}
                    placeholder="تهران"
                  />
                  {fieldErrors.cityFa ? (
                    <p className="text-xs text-destructive">{fieldErrors.cityFa}</p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-2 text-start">
                <Label htmlFor="line1">آدرس پلاک کوچه</Label>
                <Input
                  id="line1"
                  value={address.line1 ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, line1: e.target.value }))
                  }
                  className={cn(fieldErrors.line1 && "border-destructive")}
                  placeholder="خیابان، کوچه، پلاک…"
                />
                {fieldErrors.line1 ? (
                  <p className="text-xs text-destructive">{fieldErrors.line1}</p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 text-start">
                  <Label htmlFor="plaque">پلاک (اختیاری)</Label>
                  <Input
                    id="plaque"
                    value={address.plaque ?? ""}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, plaque: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 text-start">
                  <Label htmlFor="unit">واحد (اختیاری)</Label>
                  <Input
                    id="unit"
                    value={address.unit ?? ""}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, unit: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 text-start">
                  <Label htmlFor="postal">کدپستی</Label>
                  <Input
                    id="postal"
                    value={address.postalCode ?? ""}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, postalCode: e.target.value }))
                    }
                    dir="ltr"
                    style={{ textAlign: "end" }}
                  />
                </div>
              </div>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card className="space-y-4 border-border/70 p-4 shadow-elegant sm:p-5">
              <h2 className="text-start text-lg font-bold">روش ارسال</h2>
              <p className="text-start text-sm text-muted-foreground">
                هزینه بر اساس جمع سبد و آستانه ارسال رایگان محاسبه می‌شود.
              </p>
              <ShippingOption
                title="پست پیشتاز"
                desc="۳ تا ۵ روز کاری"
                priceLabel={formatPriceFa(
                  getShippingMinorForMethod("post", afterDiscount),
                )}
                selected={shipping?.method === "post"}
                onSelect={() => setShipping({ method: "post" })}
              />
              <ShippingOption
                title="پیک تهران"
                desc="همان روز یا روز بعد — فقط تهران"
                priceLabel={formatPriceFa(
                  getShippingMinorForMethod("courier", afterDiscount),
                )}
                selected={shipping?.method === "courier"}
                onSelect={() => setShipping({ method: "courier" })}
              />
              <MiniSummary afterDiscount={afterDiscount} lines={lines} />
            </Card>
          ) : null}

          {step === 3 ? (
            <Card className="space-y-4 border-border/70 p-4 shadow-elegant sm:p-5">
              <h2 className="text-start text-lg font-bold">پرداخت</h2>
              <PaymentOption
                title="درگاه آنلاین"
                desc="پرداخت امن با کارت بانکی (نمونه)"
                selected={payment?.method === "gateway"}
                onSelect={() => setPayment({ method: "gateway" })}
              />
              <PaymentOption
                title="کارت به کارت"
                desc="انتقال به شماره کارت فروشگاه + ارسال فیش (نمونه)"
                selected={payment?.method === "card"}
                onSelect={() => setPayment({ method: "card" })}
              />
              <div className="rounded-lg border border-border/60 bg-muted/25 p-3 text-start text-sm">
                <p className="font-semibold text-foreground">مبلغ قابل پرداخت</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-highlight">
                  {formatPriceFa(orderTotalMinor)}
                </p>
                {shipping ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    شامل ارسال: {formatPriceFa(shippingMinor ?? 0)}
                  </p>
                ) : null}
              </div>
            </Card>
          ) : null}

          {step === 4 && orderNumber ? (
            <Card className="space-y-5 border-border/70 p-5 text-center shadow-elegant">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                سفارش با موفقیت ثبت شد
              </p>
              <div>
                <p className="text-xs text-muted-foreground">شماره سفارش</p>
                <p className="text-xl font-bold tabular-nums tracking-tight" dir="ltr">
                  {orderNumber}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                پیامک تأیید به شماره ثبت‌شده ارسال می‌شود (نمونه). سبد خرید خالی
                شد؛ می‌توانید ادامه دهید.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button variant="luxury" size="touch" asChild>
                  <Link href="/">بازگشت به خانه</Link>
                </Button>
                <Button variant="outline" size="touch" asChild>
                  <Link href={trackingHref}>پیگیری سفارش</Link>
                </Button>
              </div>
            </Card>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {step < 4 ? (
        <div
          className={cn(
            "fixed inset-x-0 z-[48] flex gap-2 border-t border-border/80 bg-card/95 px-4 py-3 backdrop-blur-lg md:static md:mt-8 md:border-0 md:bg-transparent md:p-0",
            "bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:bottom-auto",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="touch"
            className="flex-1 md:flex-none md:px-8"
            onClick={goBack}
          >
            {step === 1 ? "سبد خرید" : "قبلی"}
          </Button>
          <Button
            type="button"
            variant="luxury"
            size="touch"
            className="flex-[2] md:flex-none md:min-w-[12rem]"
            onClick={goNext}
          >
            {step === 3 ? "ثبت سفارش" : "ادامه"}
          </Button>
        </div>
      ) : null}
    </main>
  );
}

function ShippingOption({
  title,
  desc,
  priceLabel,
  selected,
  onSelect,
}: {
  title: string;
  desc: string;
  priceLabel: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full min-h-touch items-center justify-between gap-3 rounded-xl border p-4 text-start transition-colors",
        selected
          ? "border-highlight bg-highlight/10 ring-2 ring-highlight/30"
          : "border-border/80 bg-card hover:bg-muted/30",
      )}
    >
      <div>
        <p className="font-bold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <span className="shrink-0 text-base font-bold tabular-nums text-highlight">
        {priceLabel}
      </span>
    </button>
  );
}

function PaymentOption({
  title,
  desc,
  selected,
  onSelect,
}: {
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full min-h-touch rounded-xl border p-4 text-start transition-colors",
        selected
          ? "border-highlight bg-highlight/10 ring-2 ring-highlight/30"
          : "border-border/80 bg-card hover:bg-muted/30",
      )}
    >
      <p className="font-bold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </button>
  );
}

function MiniSummary({
  afterDiscount,
  lines,
}: {
  afterDiscount: number;
  lines: { id: string; titleFa: string; quantity: number; unitMinor: number }[];
}) {
  return (
    <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-3 text-start text-sm">
      <p className="mb-2 font-semibold text-foreground">خلاصه سبد</p>
      <ul className="max-h-32 space-y-1 overflow-y-auto text-muted-foreground">
        {lines.map((l) => (
          <li key={l.id} className="flex justify-between gap-2">
            <span className="truncate">
              {l.titleFa} × {new Intl.NumberFormat("fa-IR").format(l.quantity)}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatPriceFa(l.unitMinor * l.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-border/60 pt-2 font-bold text-foreground">
        جمع پس از تخفیف:{" "}
        <span className="tabular-nums text-highlight">
          {formatPriceFa(afterDiscount)}
        </span>
      </p>
    </div>
  );
}
