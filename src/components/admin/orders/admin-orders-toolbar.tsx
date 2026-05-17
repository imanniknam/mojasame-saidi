"use client";

import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTransition, type FormEvent } from "react";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { orderStatusLabels, paymentStatusLabels } from "@/lib/admin/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type AdminOrdersToolbarProps = {
  initial: {
    q?: string;
    status?: string;
    paymentStatus?: string;
    limit?: string;
  };
  className?: string;
};

const selectClass =
  "flex h-12 w-full min-h-touch rounded-lg border border-input bg-background px-3 text-base text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-11 md:text-sm";

export function AdminOrdersToolbar({ initial, className }: AdminOrdersToolbarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function applyParams(params: URLSearchParams) {
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/admin/orders?${qs}` : "/admin/orders");
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const q = String(form.get("q") ?? "").trim();
    const status = String(form.get("status") ?? "all");
    const paymentStatus = String(form.get("paymentStatus") ?? "all");
    const limit = String(form.get("limit") ?? "20");

    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
    if (limit !== "20") params.set("limit", limit);
    applyParams(params);
  }

  function resetFilters() {
    startTransition(() => router.push("/admin/orders"));
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "space-y-4 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5",
        pending && "opacity-70",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <SlidersHorizontal className="size-4 text-highlight" aria-hidden />
        جستجو و فیلتر
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="q">جستجو</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              name="q"
              defaultValue={initial.q ?? ""}
              placeholder="شماره سفارش، ایمیل، تلفن، نام"
              className="ps-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">وضعیت سفارش</Label>
          <select id="status" name="status" defaultValue={initial.status ?? "all"} className={selectClass}>
            <option value="all">همه</option>
            {Object.values(OrderStatus).map((s) => (
              <option key={s} value={s}>
                {orderStatusLabels[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentStatus">وضعیت پرداخت</Label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            defaultValue={initial.paymentStatus ?? "all"}
            className={selectClass}
          >
            <option value="all">همه</option>
            {Object.values(PaymentStatus).map((s) => (
              <option key={s} value={s}>
                {paymentStatusLabels[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="limit">تعداد در صفحه</Label>
          <select id="limit" name="limit" defaultValue={initial.limit ?? "20"} className={selectClass}>
            <option value="10">۱۰</option>
            <option value="20">۲۰</option>
            <option value="50">۵۰</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="luxury" size="touch" disabled={pending}>
          اعمال فیلتر
        </Button>
        <Button type="button" variant="outline" size="touch" onClick={resetFilters} disabled={pending}>
          پاک کردن
        </Button>
      </div>
    </form>
  );
}
