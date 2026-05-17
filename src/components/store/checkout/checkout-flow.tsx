"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  CreditCard,
  Home,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { computeCartTotals, type CartTotals } from "@/lib/cart/totals";
import { formatPriceFa } from "@/lib/format";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartHydration } from "@/hooks/use-cart-hydration";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StepId = "address" | "shipping" | "payment" | "confirmation";
type ShippingMethod = "standard" | "express" | "pickup";
type PaymentMethod = "online" | "cardToCard";

type AddressValues = {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  notes: string;
};

type FieldErrors = Partial<Record<keyof AddressValues, string>>;
type ConfirmationSnapshot = {
  orderNumber: string;
  totals: CartTotals;
  itemCount: number;
  address: AddressValues;
  shipping: ShippingMethod;
  payment: PaymentMethod;
};

const steps: { id: StepId; title: string; icon: typeof MapPin }[] = [
  { id: "address", title: "آدرس", icon: MapPin },
  { id: "shipping", title: "ارسال", icon: Truck },
  { id: "payment", title: "پرداخت", icon: CreditCard },
  { id: "confirmation", title: "تأیید", icon: CheckCircle2 },
];

const shippingOptions: Record<
  ShippingMethod,
  {
    title: string;
    description: string;
    eta: string;
    feeMinor: number;
  }
> = {
  standard: {
    title: "ارسال معمولی",
    description: "پیشنهاد شده برای بیشتر سفارش‌ها",
    eta: "۲ تا ۴ روز کاری",
    feeMinor: 85_000,
  },
  express: {
    title: "ارسال سریع",
    description: "مناسب سفارش‌های فوری",
    eta: "۱ تا ۲ روز کاری",
    feeMinor: 145_000,
  },
  pickup: {
    title: "هماهنگی تلفنی",
    description: "ارسال پس از تماس پشتیبانی",
    eta: "با هماهنگی",
    feeMinor: 0,
  },
};

const initialAddress: AddressValues = {
  fullName: "",
  phone: "",
  province: "",
  city: "",
  postalCode: "",
  addressLine: "",
  notes: "",
};

function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function validateAddress(values: AddressValues): FieldErrors {
  const errors: FieldErrors = {};
  const phone = normalizeDigits(values.phone).replace(/\D/g, "");
  const postalCode = normalizeDigits(values.postalCode).replace(/\D/g, "");

  if (values.fullName.trim().length < 3) {
    errors.fullName = "نام گیرنده را کامل وارد کنید.";
  }
  if (!/^09\d{9}$/.test(phone)) {
    errors.phone = "شماره موبایل معتبر مثل 09123456789 وارد کنید.";
  }
  if (values.province.trim().length < 2) {
    errors.province = "استان را وارد کنید.";
  }
  if (values.city.trim().length < 2) {
    errors.city = "شهر را وارد کنید.";
  }
  if (postalCode && !/^\d{10}$/.test(postalCode)) {
    errors.postalCode = "کد پستی باید ۱۰ رقم باشد.";
  }
  if (values.addressLine.trim().length < 12) {
    errors.addressLine = "آدرس را با جزئیات بیشتری وارد کنید.";
  }

  return errors;
}

function stepIndex(step: StepId) {
  return steps.findIndex((s) => s.id === step);
}

function Stepper({ current }: { current: StepId }) {
  const currentIndex = stepIndex(current);

  return (
    <ol className="grid grid-cols-4 gap-1 rounded-2xl border border-border/70 bg-card/80 p-1 shadow-elegant">
      {steps.map((step, index) => {
        const active = step.id === current;
        const done = index < currentIndex;
        const Icon = step.icon;
        return (
          <li key={step.id}>
            <div
              className={cn(
                "flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-[0.65rem] font-bold transition-colors sm:min-h-16 sm:text-xs",
                active && "bg-highlight text-highlight-foreground shadow-elegant",
                done && !active && "bg-accent text-accent-foreground",
                !active && !done && "text-muted-foreground",
              )}
              aria-current={active ? "step" : undefined}
            >
              <Icon className="size-5" aria-hidden />
              <span>{step.title}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-start text-xs font-medium text-destructive">{children}</p>;
}

export function CheckoutFlow() {
  const ready = useCartHydration();
  const reduceMotion = useReducedMotion();
  const lines = useCartStore((s) => s.lines);
  const discount = useCartStore((s) => s.discount);
  const clearCart = useCartStore((s) => s.clear);

  const [step, setStep] = useState<StepId>("address");
  const [address, setAddress] = useState<AddressValues>(initialAddress);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("online");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmation, setConfirmation] =
    useState<ConfirmationSnapshot | null>(null);

  const shippingFeeOverride =
    shipping === "standard" ? undefined : shippingOptions[shipping].feeMinor;
  const totals = useMemo(
    () => computeCartTotals(lines, discount, shippingFeeOverride),
    [lines, discount, shippingFeeOverride],
  );

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const empty = ready && lines.length === 0 && !orderNumber;
  const displayTotals = confirmation?.totals ?? totals;
  const displayItemCount = confirmation?.itemCount ?? itemCount;
  const displayAddress = confirmation?.address ?? address;
  const displayShipping = confirmation?.shipping ?? shipping;
  const displayPayment = confirmation?.payment ?? payment;

  function updateField(field: keyof AddressValues, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function goAddressNext(e?: FormEvent) {
    e?.preventDefault();
    const nextErrors = validateAddress(address);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("لطفاً خطاهای فرم آدرس را برطرف کنید.");
      return;
    }
    setStep("shipping");
  }

  async function placeOrder() {
    const nextErrors = validateAddress(address);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStep("address");
      toast.error("اطلاعات آدرس نیاز به تکمیل دارد.");
      return;
    }

    setPlacingOrder(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitMinor: line.unitMinor,
          })),
          discount,
          shipping,
          payment,
          address,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        order?: { orderNumber: string };
        totals?: CartTotals;
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok || !payload.order) {
        toast.error(payload.error?.message ?? "ثبت سفارش ناموفق بود.");
        return;
      }

      const nextOrder = payload.order.orderNumber;
      const confirmedTotals = payload.totals ?? totals;
      setOrderNumber(nextOrder);
      setConfirmation({
        orderNumber: nextOrder,
        totals: confirmedTotals,
        itemCount,
        address,
        shipping,
        payment,
      });
      setStep("confirmation");
      clearCart();
      toast.success("سفارش شما ثبت شد.");
    } catch {
      toast.error("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setPlacingOrder(false);
    }
  }

  const stepMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.22 },
      };

  if (!ready) {
    return (
      <main className="ds-section mx-auto max-w-5xl animate-pulse space-y-6 pb-32">
        <div className="h-8 w-40 rounded-lg bg-muted/60" />
        <div className="h-20 rounded-2xl bg-muted/50" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-96 rounded-2xl bg-muted/50 lg:col-span-2" />
          <div className="h-72 rounded-2xl bg-muted/50" />
        </div>
      </main>
    );
  }

  if (empty) {
    return (
      <main className="ds-section mx-auto max-w-lg space-y-6 pb-32 text-center">
        <Card elevated className="space-y-5 p-8">
          <PackageCheck className="mx-auto size-14 text-muted-foreground" strokeWidth={1.3} />
          <div className="space-y-2">
            <h1 className="ds-title">سبد خرید خالی است</h1>
            <p className="ds-subtitle">
              برای ادامه تسویه حساب، ابتدا محصولی به سبد اضافه کنید.
            </p>
          </div>
          <Button variant="luxury" size="touch" asChild>
            <Link href="/">بازگشت به فروشگاه</Link>
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="ds-section mx-auto max-w-5xl pb-36 md:pb-10">
      <header className="mb-6 space-y-3 text-start">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ds-overline">تسویه حساب</p>
            <h1 className="ds-display text-2xl sm:text-3xl">تکمیل سفارش</h1>
          </div>
          {orderNumber ? (
            <Badge variant="success" className="min-h-8 px-3">
              شماره سفارش: {orderNumber}
            </Badge>
          ) : null}
        </div>
        <Stepper current={step} />
      </header>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <section className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === "address" ? (
              <motion.div key="address" {...stepMotion}>
                <Card elevated className="space-y-5 border-border/70 p-4 sm:p-6">
                  <div className="space-y-1 text-start">
                    <h2 className="ds-title text-xl">آدرس تحویل</h2>
                    <p className="ds-subtitle">
                      اطلاعات را کوتاه و دقیق وارد کنید تا ارسال سریع‌تر انجام شود.
                    </p>
                  </div>

                  <form onSubmit={goAddressNext} className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 text-start">
                      <Label htmlFor="fullName">نام گیرنده</Label>
                      <Input
                        id="fullName"
                        value={address.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        placeholder="مثلاً سارا احمدی"
                        autoComplete="name"
                        aria-invalid={!!errors.fullName}
                      />
                      <ErrorText>{errors.fullName}</ErrorText>
                    </div>

                    <div className="space-y-2 text-start">
                      <Label htmlFor="phone">شماره موبایل</Label>
                      <Input
                        id="phone"
                        value={address.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="09123456789"
                        inputMode="tel"
                        autoComplete="tel"
                        aria-invalid={!!errors.phone}
                      />
                      <ErrorText>{errors.phone}</ErrorText>
                    </div>

                    <div className="space-y-2 text-start">
                      <Label htmlFor="province">استان</Label>
                      <Input
                        id="province"
                        value={address.province}
                        onChange={(e) => updateField("province", e.target.value)}
                        placeholder="تهران"
                        autoComplete="address-level1"
                        aria-invalid={!!errors.province}
                      />
                      <ErrorText>{errors.province}</ErrorText>
                    </div>

                    <div className="space-y-2 text-start">
                      <Label htmlFor="city">شهر</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="تهران"
                        autoComplete="address-level2"
                        aria-invalid={!!errors.city}
                      />
                      <ErrorText>{errors.city}</ErrorText>
                    </div>

                    <div className="space-y-2 text-start sm:col-span-2">
                      <Label htmlFor="addressLine">آدرس کامل</Label>
                      <textarea
                        id="addressLine"
                        value={address.addressLine}
                        onChange={(e) => updateField("addressLine", e.target.value)}
                        placeholder="خیابان، کوچه، پلاک، واحد"
                        autoComplete="street-address"
                        rows={3}
                        aria-invalid={!!errors.addressLine}
                        className="min-h-28 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-base leading-7 text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      />
                      <ErrorText>{errors.addressLine}</ErrorText>
                    </div>

                    <div className="space-y-2 text-start">
                      <Label htmlFor="postalCode">کد پستی (اختیاری)</Label>
                      <Input
                        id="postalCode"
                        value={address.postalCode}
                        onChange={(e) => updateField("postalCode", e.target.value)}
                        placeholder="۱۰ رقم"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        aria-invalid={!!errors.postalCode}
                      />
                      <ErrorText>{errors.postalCode}</ErrorText>
                    </div>

                    <div className="space-y-2 text-start">
                      <Label htmlFor="notes">توضیحات سفارش (اختیاری)</Label>
                      <Input
                        id="notes"
                        value={address.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="مثلاً ساعت مناسب تماس"
                      />
                    </div>

                    <div className="hidden justify-end sm:col-span-2 md:flex">
                      <Button type="submit" variant="luxury" size="touch">
                        ادامه به روش ارسال
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            ) : null}

            {step === "shipping" ? (
              <motion.div key="shipping" {...stepMotion}>
                <Card elevated className="space-y-5 border-border/70 p-4 sm:p-6">
                  <div className="space-y-1 text-start">
                    <h2 className="ds-title text-xl">روش ارسال</h2>
                    <p className="ds-subtitle">
                      ساده‌ترین گزینه برای شما انتخاب شده؛ در صورت نیاز تغییر دهید.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {(Object.keys(shippingOptions) as ShippingMethod[]).map((key) => {
                      const option = shippingOptions[key];
                      const active = shipping === key;
                      const feeLabel =
                        key === "standard" && active && totals.shippingMinor === 0
                          ? "رایگان"
                          : option.feeMinor === 0
                            ? "رایگان"
                            : formatPriceFa(option.feeMinor);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setShipping(key)}
                          className={cn(
                            "flex min-h-touch items-start gap-3 rounded-2xl border p-4 text-start transition-all",
                            active
                              ? "border-highlight/60 bg-highlight/10 shadow-elegant"
                              : "border-border/80 bg-background hover:bg-muted/35",
                          )}
                          aria-pressed={active}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                              active
                                ? "border-highlight bg-highlight text-highlight-foreground"
                                : "border-border bg-card",
                            )}
                          >
                            {active ? <CheckCircle2 className="size-4" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-bold">{option.title}</span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                              {option.description} · {option.eta}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-bold tabular-nums">
                            {feeLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="hidden justify-between gap-3 md:flex">
                    <Button variant="ghost" size="touch" onClick={() => setStep("address")}>
                      بازگشت
                    </Button>
                    <Button variant="luxury" size="touch" onClick={() => setStep("payment")}>
                      ادامه به پرداخت
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : null}

            {step === "payment" ? (
              <motion.div key="payment" {...stepMotion}>
                <Card elevated className="space-y-5 border-border/70 p-4 sm:p-6">
                  <div className="space-y-1 text-start">
                    <h2 className="ds-title text-xl">روش پرداخت</h2>
                    <p className="ds-subtitle">
                      پرداخت امن آنلاین پیشنهاد می‌شود؛ ثبت سفارش در هر دو حالت ساده است.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {[
                      {
                        id: "online" as const,
                        title: "پرداخت آنلاین امن",
                        desc: "اتصال به درگاه پرداخت در مرحله نهایی",
                        icon: ShieldCheck,
                      },
                      {
                        id: "cardToCard" as const,
                        title: "کارت به کارت",
                        desc: "پس از ثبت، پشتیبانی برای هماهنگی تماس می‌گیرد",
                        icon: CreditCard,
                      },
                    ].map((option) => {
                      const active = payment === option.id;
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setPayment(option.id)}
                          className={cn(
                            "flex min-h-touch items-center gap-3 rounded-2xl border p-4 text-start transition-all",
                            active
                              ? "border-highlight/60 bg-highlight/10 shadow-elegant"
                              : "border-border/80 bg-background hover:bg-muted/35",
                          )}
                          aria-pressed={active}
                        >
                          <Icon className="size-6 shrink-0 text-highlight" />
                          <span className="min-w-0 flex-1">
                            <span className="block font-bold">{option.title}</span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                              {option.desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="hidden justify-between gap-3 md:flex">
                    <Button variant="ghost" size="touch" onClick={() => setStep("shipping")}>
                      بازگشت
                    </Button>
                    <Button
                      variant="luxury"
                      size="touch"
                      onClick={() => void placeOrder()}
                      disabled={placingOrder}
                    >
                      {placingOrder ? "در حال ثبت…" : "ثبت سفارش"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : null}

            {step === "confirmation" ? (
              <motion.div key="confirmation" {...stepMotion}>
                <Card elevated className="space-y-6 border-border/70 p-6 text-center sm:p-8">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shadow-elegant dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="size-9" aria-hidden />
                  </div>
                  <div className="space-y-2">
                    <h2 className="ds-title">سفارش شما ثبت شد</h2>
                    <p className="ds-subtitle mx-auto max-w-md">
                      شماره سفارش {confirmation?.orderNumber ?? orderNumber} است. جزئیات سفارش برای پیگیری ذخیره شد.
                    </p>
                  </div>
                  <div className="flex flex-col justify-center gap-2 sm:flex-row">
                    <Button variant="luxury" size="touch" asChild>
                      <Link href="/">ادامه خرید</Link>
                    </Button>
                    <Button variant="outline" size="touch" asChild>
                      <Link href="/orders">پیگیری سفارش</Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card elevated className="border-border/70 p-4 shadow-elegant sm:p-5">
            <h2 className="mb-4 text-start text-base font-bold">خلاصه سفارش</h2>
            <div className="mb-4 space-y-2 rounded-xl bg-muted/35 p-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">تعداد کالا</span>
                <span className="font-bold tabular-nums">
                  {new Intl.NumberFormat("fa-IR").format(displayItemCount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-start">
                <span className="text-muted-foreground">روش ارسال</span>
                <span className="truncate font-semibold">
                  {shippingOptions[displayShipping].title}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-start">
                <span className="text-muted-foreground">پرداخت</span>
                <span className="truncate font-semibold">
                  {displayPayment === "online" ? "آنلاین" : "کارت به کارت"}
                </span>
              </div>
              {displayAddress.city ? (
                <div className="flex items-center justify-between gap-3 text-start">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Home className="size-4" aria-hidden />
                    مقصد
                  </span>
                  <span className="truncate font-semibold">
                    {displayAddress.province}، {displayAddress.city}
                  </span>
                </div>
              ) : null}
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">جمع کالاها</dt>
                <dd className="font-semibold tabular-nums">
                  {formatPriceFa(displayTotals.subtotalMinor)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">تخفیف</dt>
                <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {displayTotals.discountMinor > 0
                    ? `−${formatPriceFa(displayTotals.discountMinor)}`
                    : formatPriceFa(0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">ارسال</dt>
                <dd className="font-semibold tabular-nums">
                  {displayTotals.shippingMinor === 0 ? "رایگان" : formatPriceFa(displayTotals.shippingMinor)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border/80 pt-3 text-base">
                <dt className="font-bold">قابل پرداخت</dt>
                <dd className="font-bold tabular-nums text-highlight">
                  {formatPriceFa(displayTotals.totalMinor)}
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>

      {step !== "confirmation" ? (
        <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] z-[48] border-t border-border/80 bg-card/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-float backdrop-blur-lg md:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 pt-3">
            <div className="min-w-0 flex-1 text-start">
              <p className="text-xs text-muted-foreground">قابل پرداخت</p>
              <p className="truncate text-lg font-bold tabular-nums text-highlight">
                {formatPriceFa(totals.totalMinor)}
              </p>
            </div>
            {step === "address" ? (
              <Button variant="luxury" size="touch" className="shrink-0 px-6" onClick={() => goAddressNext()}>
                ادامه
              </Button>
            ) : null}
            {step === "shipping" ? (
              <Button variant="luxury" size="touch" className="shrink-0 px-6" onClick={() => setStep("payment")}>
                ادامه
              </Button>
            ) : null}
            {step === "payment" ? (
              <Button
                variant="luxury"
                size="touch"
                className="shrink-0 px-6"
                onClick={() => void placeOrder()}
                disabled={placingOrder}
              >
                {placingOrder ? "در حال ثبت…" : "ثبت سفارش"}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
