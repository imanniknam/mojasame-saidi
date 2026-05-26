import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { Package, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPriceFa } from "@/lib/format";
import { getActiveSessionUser } from "@/lib/auth/server";
import { orderStatusLabels, orderStatusBadgeVariant } from "@/lib/admin/labels";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "سفارش‌های من",
  description: "مشاهده تاریخچه سفارش‌های شما در فروشگاه مجسمه‌سازی سعیدی.",
  path: "/orders",
  noIndex: true,
});

export default async function OrdersPage() {
  const sessionUser = await getActiveSessionUser();
  if (!sessionUser || !sessionUser.customerId) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { customerId: sessionUser.customerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalMinor: true,
      createdAt: true,
      items: {
        take: 3,
        select: { titleFaSnap: true },
      },
    },
  });

  return (
    <main className="ds-section mx-auto max-w-3xl space-y-6 pb-28">
      <header className="space-y-2 text-start">
        <p className="ds-overline text-highlight">My Orders</p>
        <h1 className="ds-display text-3xl">سفارش‌های من</h1>
        <p className="ds-subtitle">
          تاریخچه و وضعیت تمام سفارش‌های شما
        </p>
      </header>

      {orders.length === 0 ? (
        <Card
          elevated
          className="relative overflow-hidden rounded-[2rem] border-highlight/15 p-8 text-center"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--highlight)/0.12),transparent_18rem)]"
            aria-hidden
          />
          <div className="relative mx-auto flex max-w-md flex-col items-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full border border-highlight/20 bg-highlight/10 text-highlight">
              <Package className="size-8" aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              هنوز سفارشی ثبت نشده
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              پس از خرید، سفارش‌های شما اینجا نمایش داده می‌شوند.
            </p>
            <Button variant="luxury" size="touch" asChild className="mt-6">
              <Link href="/products">
                <ShoppingBag className="size-5" aria-hidden />
                مشاهده محصولات
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}

      <div className="pt-2 text-center">
        <Button variant="outline" size="touch" asChild>
          <Link href="/profile">بازگشت به حساب کاربری</Link>
        </Button>
      </div>
    </main>
  );
}

function OrderRow({
  order,
}: {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalMinor: number;
    createdAt: Date;
    items: { titleFaSnap: string }[];
  };
}) {
  const dateFa = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(order.createdAt);

  const itemSummary =
    order.items.map((i) => i.titleFaSnap).join("، ") || "—";

  return (
    <Card
      elevated
      className="overflow-hidden rounded-[1.5rem] border-highlight/10 p-4 transition-[border-color] hover:border-highlight/25 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-foreground" dir="ltr">
              #{order.orderNumber}
            </span>
            <Badge variant={orderStatusBadgeVariant[order.status]}>
              {orderStatusLabels[order.status]}
            </Badge>
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {itemSummary}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-end">
          <div>
            <p className="text-base font-bold tabular-nums text-highlight">
              {formatPriceFa(order.totalMinor)}
            </p>
            <p className="text-xs text-muted-foreground">{dateFa}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
