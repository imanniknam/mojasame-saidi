"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Minus,
  PackageOpen,
  Plus,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { computeCartTotals, FREE_SHIPPING_THRESHOLD_MINOR } from "@/lib/cart/totals";
import { listPublicPromoHints } from "@/lib/cart/discount-codes";
import { formatPriceFa } from "@/lib/format";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartHydration } from "@/hooks/use-cart-hydration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CartPageContent() {
  const ready = useCartHydration();
  const lines = useCartStore((s) => s.lines);
  const discount = useCartStore((s) => s.discount);
  const removeLine = useCartStore((s) => s.removeLine);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const applyDiscountCode = useCartStore((s) => s.applyDiscountCode);
  const clearDiscount = useCartStore((s) => s.clearDiscount);

  const [codeInput, setCodeInput] = useState("");

  const totals = useMemo(
    () => computeCartTotals(lines, discount),
    [lines, discount],
  );

  if (!ready) {
    return (
      <main className="ds-section mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-8 w-40 bg-muted/60" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted/50" />
            ))}
          </div>
          <div className="h-64 bg-muted/50" />
        </div>
      </main>
    );
  }

  function onApplyCode(e: React.FormEvent) {
    e.preventDefault();
    const raw = codeInput.trim();
    if (!raw) return;
    const res = applyDiscountCode(raw);
    if (res.ok) {
      toast.success("کد تخفیف اعمال شد");
      setCodeInput("");
    } else {
      toast.error(res.message);
    }
  }

  const empty = lines.length === 0;

  return (
    <main className="ds-container relative pb-32 pt-8 md:pb-16 lg:pt-10">
      <header className="mb-7">
        <p className="ds-overline">Cart</p>
        <h1 className="ds-title mt-2 text-foreground">سبد خرید</h1>
        <p data-numeric className="mt-2 text-sm text-muted-foreground">
          {empty
            ? "سبد شما خالی است."
            : `${new Intl.NumberFormat("fa-IR").format(lines.reduce((a, l) => a + l.quantity, 0))} کالا در سبد`}
        </p>
      </header>

      {empty ? (
        <div className="flex flex-col items-center border border-border bg-card px-6 py-16 text-center">
          <PackageOpen
            className="size-9 stroke-[1.2] text-muted-foreground/60"
            aria-hidden
          />
          <h2 className="ds-heading mt-4 text-foreground">هنوز چیزی انتخاب نکرده‌اید</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            از میان مجسمه‌ها و دکورهای دست‌ساز، اثر مورد علاقه‌تان را به سبد اضافه کنید.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="luxury" size="touch" className="px-6" asChild>
              <Link href="/products">مشاهده همه آثار</Link>
            </Button>
            <Button variant="outline" size="touch" className="px-6" asChild>
              <Link href="/categories">مجموعه‌ها</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="space-y-4 lg:col-span-2">
            {/*
              بدون AnimatePresence.
              با framer-motion 11 روی React 19 انیمیشن خروج هرگز کامل نمی‌شد و
              کارتِ حذف‌شده با opacity ۱ روی صفحه می‌ماند: کالا از سبد می‌رفت و
              جمع به‌روز می‌شد، ولی کاربر همچنان آن را می‌دید. انیمیشنی که
              نمی‌شود به آن اعتماد کرد، بدتر از نبودنش است.
            */}
            <>
              {lines.map((line) => (
                <div key={line.id}>
                  <div className="border border-border bg-card transition-colors duration-base hover:border-primary/30">
                    <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                      <Link
                        href={line.href ?? "/products"}
                        className="relative aspect-square w-[5.25rem] shrink-0 overflow-hidden bg-muted/40 sm:w-28"
                      >
                        <Image
                          src={line.imageUrl ?? "/images/placeholder-product.svg"}
                          alt={line.titleFa}
                          fill
                          sizes="112px"
                          className="object-cover"
                          unoptimized={(line.imageUrl ?? "").endsWith(".svg")}
                        />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col gap-2 text-start">
                        <Link
                          href={line.href ?? "/products"}
                          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary sm:text-base"
                        >
                          {line.titleFa}
                        </Link>
                        {line.variantNameFa ? (
                          <p className="text-xs font-medium text-primary/80">
                            سایز: {line.variantNameFa}
                          </p>
                        ) : null}
                        <p className="text-sm tabular-nums text-muted-foreground">
                          واحد: {formatPriceFa(line.unitMinor)}
                        </p>
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center border border-border bg-background">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-10 rounded-none"
                              aria-label="کم کردن تعداد"
                              onClick={() =>
                                setQuantity(
                                  line.id,
                                  line.quantity <= 1 ? 0 : line.quantity - 1,
                                )
                              }
                            >
                              <Minus className="size-4" />
                            </Button>
                            <span className="min-w-[2.25rem] text-center text-sm font-bold tabular-nums">
                              {new Intl.NumberFormat("fa-IR").format(
                                line.quantity,
                              )}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-10 rounded-none"
                              aria-label="افزودن تعداد"
                              onClick={() =>
                                setQuantity(line.id, line.quantity + 1)
                              }
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold tabular-nums text-foreground">
                              {formatPriceFa(line.unitMinor * line.quantity)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              aria-label="حذف از سبد"
                              onClick={() => {
                                removeLine(line.id);
                                toast.message("از سبد حذف شد", {
                                  description: line.titleFa,
                                });
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-3 flex items-center gap-2 text-start text-sm font-bold text-foreground">
                <Tag className="size-4 stroke-[1.6] text-primary" aria-hidden />
                کد تخفیف
              </h2>
              <form onSubmit={onApplyCode} className="flex flex-col gap-2 sm:flex-row">
                <Label htmlFor="cart-discount" className="sr-only">
                  کد تخفیف
                </Label>
                <Input
                  id="cart-discount"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="مثلاً WELCOME10"
                  className="h-12 flex-1"
                  autoComplete="off"
                />
                <Button type="submit" variant="secondary" className="h-12 shrink-0 px-6">
                  اعمال
                </Button>
              </form>
              <p className="mt-2 text-start text-xs text-muted-foreground">
                نمونه: {listPublicPromoHints().join("، ")}
              </p>
              {discount ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1 font-semibold">
                    {discount.code}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive"
                    onClick={() => {
                      clearDiscount();
                      toast.message("کد تخفیف حذف شد");
                    }}
                  >
                    حذف کد
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-4 text-start text-sm font-bold text-foreground">خلاصه سفارش</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">جمع کالاها</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatPriceFa(totals.subtotalMinor)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">تخفیف</dt>
                  <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {totals.discountMinor > 0
                      ? `−${formatPriceFa(totals.discountMinor)}`
                      : formatPriceFa(0)}
                  </dd>
                </div>
                <div className="h-px bg-border/80" />
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Truck className="size-3.5 shrink-0" aria-hidden />
                    ارسال
                  </dt>
                  <dd className="text-start font-semibold tabular-nums">
                    {totals.shippingMinor === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        رایگان
                      </span>
                    ) : (
                      formatPriceFa(totals.shippingMinor)
                    )}
                  </dd>
                </div>
                {!totals.qualifiesFreeShipping && totals.amountToFreeShippingMinor > 0 ? (
                  <p className="border border-border bg-background p-2.5 text-xs leading-relaxed text-muted-foreground">
                    با خرید بیشتر از{" "}
                    <span className="font-semibold text-foreground">
                      {formatPriceFa(FREE_SHIPPING_THRESHOLD_MINOR)}
                    </span>
                    ، ارسال رایگان می‌شود. مانده:{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatPriceFa(totals.amountToFreeShippingMinor)}
                    </span>
                  </p>
                ) : null}
                <div className="flex justify-between gap-4 border-t border-border/80 pt-3 text-base">
                  <dt className="font-bold">مبلغ قابل پرداخت</dt>
                  <dd className="font-bold tabular-nums text-primary">
                    {formatPriceFa(totals.totalMinor)}
                  </dd>
                </div>
              </dl>

              <Button variant="luxury" size="touch" className="mt-5 hidden w-full md:inline-flex" asChild>
                <Link href="/checkout">ادامه و تسویه حساب</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {!empty ? (
        <div
          className={cn(
            "fixed inset-x-0 z-[48] border-t border-border/80 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden",
            "bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]",
          )}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 pt-3">
            <div className="min-w-0 flex-1 text-start">
              <p className="text-xs text-muted-foreground">مبلغ قابل پرداخت</p>
              <p className="truncate text-lg font-bold tabular-nums text-primary">
                {formatPriceFa(totals.totalMinor)}
              </p>
            </div>
            <Button variant="luxury" size="touch" className="shrink-0 px-6" asChild>
              <Link href="/checkout">ادامه خرید</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
