import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  LayoutGrid,
  Package,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPriceFa } from "@/lib/format";
import { orderStatusBadgeVariant, orderStatusLabels } from "@/lib/admin/labels";
import { getAdminDashboardStats, listRecentOrders } from "@/lib/admin/queries";

const fa = (n: number) => n.toLocaleString("fa-IR");

/**
 * راهنمای شروع.
 * وقتی کاتالوگ خالی است، نمایش چهار عددِ صفر به فروشنده هیچ کمکی نمی‌کند —
 * چیزی که لازم دارد ترتیب کارهاست.
 */
function GettingStarted({
  hasCategories,
  hasProducts,
}: {
  hasCategories: boolean;
  hasProducts: boolean;
}) {
  const steps = [
    {
      done: hasCategories,
      titleFa: "دسته‌بندی‌ها را بسازید",
      bodyFa: "ساختار مجموعه‌ها پایه‌ی کاتالوگ است.",
      href: "/admin/categories",
      cta: "مدیریت دسته‌ها",
    },
    {
      done: hasProducts,
      titleFa: "اولین محصول را اضافه کنید",
      bodyFa: "عنوان، قیمت، عکس و موجودی را وارد کنید.",
      href: "/admin/products/new",
      cta: "افزودن محصول",
    },
    {
      done: false,
      titleFa: "صفحه اصلی را بچینید",
      bodyFa: "ترتیب بخش‌ها و محصولات ویژه را تعیین کنید.",
      href: "/admin/homepage",
      cta: "تنظیم صفحه اصلی",
    },
  ];

  return (
    <section className="border border-primary/30 bg-card p-5">
      <h2 className="text-sm font-bold text-foreground">شروع کنید</h2>
      <p className="mt-1 text-[0.8125rem] text-muted-foreground">
        فروشگاه آماده است و منتظر کاتالوگ شماست.
      </p>

      <ol className="mt-5 grid gap-px bg-border sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.titleFa} className="bg-card p-4">
            <div className="flex items-center gap-2">
              <span
                data-numeric
                className={
                  step.done
                    ? "flex size-5 items-center justify-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground"
                    : "flex size-5 items-center justify-center rounded-full border border-border text-[0.625rem] font-bold text-muted-foreground"
                }
              >
                {step.done ? "✓" : fa(index + 1)}
              </span>
              <p className="text-[0.8125rem] font-semibold text-foreground">
                {step.titleFa}
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {step.bodyFa}
            </p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href={step.href}>{step.cta}</Link>
            </Button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getAdminDashboardStats(),
    listRecentOrders(5),
  ]);

  const catalogEmpty = stats.products === 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="داشبورد"
        description="نمای کلی فروشگاه و دسترسی سریع به کارهای روزمره."
        actionLabel="محصول جدید"
        actionHref="/admin/products/new"
      />

      {catalogEmpty ? (
        <GettingStarted hasCategories={stats.categories > 0} hasProducts={false} />
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="فروش محقق‌شده"
          value={formatPriceFa(stats.revenueMinor)}
          hint="سفارش‌های پرداخت‌شده"
          icon={Wallet}
        />
        <AdminStatCard
          label="سفارش‌های باز"
          value={fa(stats.openOrders)}
          hint={`از ${fa(stats.orders)} سفارش`}
          icon={ShoppingBag}
          href="/admin/orders"
          tone={stats.openOrders > 0 ? "attention" : "default"}
        />
        <AdminStatCard
          label="محصولات فعال"
          value={fa(stats.activeProducts)}
          hint={`از ${fa(stats.products)} محصول`}
          icon={Package}
          href="/admin/products"
        />
        <AdminStatCard
          label="مشتریان"
          value={fa(stats.customers)}
          hint={`${fa(stats.categories)} دسته‌بندی`}
          icon={Users}
          href="/admin/customers"
        />
      </section>

      {stats.lowStock > 0 ? (
        <section className="flex flex-wrap items-center gap-3 border border-amber-500/40 bg-amber-500/5 p-4">
          <AlertTriangle className="size-5 shrink-0 stroke-[1.6] text-amber-400" aria-hidden />
          <p className="min-w-0 flex-1 text-[0.8125rem] text-foreground">
            <span data-numeric className="font-bold">
              {fa(stats.lowStock)}
            </span>{" "}
            محصول با موجودی کم (۳ عدد یا کمتر) نیاز به بررسی دارد.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">بررسی موجودی</Link>
          </Button>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-foreground">آخرین سفارش‌ها</h2>
          {recentOrders.length > 0 ? (
            <Link
              href="/admin/orders"
              className="group inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              همه سفارش‌ها
              <ArrowLeft
                className="size-3.5 transition-transform duration-base group-hover:-translate-x-1"
                aria-hidden
              />
            </Link>
          ) : null}
        </div>

        {recentOrders.length === 0 ? (
          <p className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            هنوز سفارشی ثبت نشده است.
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border bg-card">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-wrap items-center gap-3 p-4 transition-colors duration-fast hover:bg-accent/40"
                >
                  <span
                    dir="ltr"
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {order.orderNumber}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-foreground">
                    {order.customer?.displayFa ?? order.guestNameFa ?? "مهمان"}
                  </span>
                  <Badge variant={orderStatusBadgeVariant[order.status]}>
                    {orderStatusLabels[order.status]}
                  </Badge>
                  <span data-numeric className="text-[0.8125rem] font-bold text-foreground">
                    {formatPriceFa(order.totalMinor)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
