import Link from "next/link";
import { ArrowLeft, LayoutGrid, Package, ShoppingBag, Users } from "lucide-react";
import { AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin/navigation";
import { getAdminDashboardStats } from "@/lib/admin/queries";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const quickLinks = adminNavItems.filter((item) => item.href !== "/admin");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminPageHeader
        title="داشبورد"
        description="نمای کلی فروشگاه، موجودی و دسترسی سریع به بخش‌های مدیریت."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="کل محصولات"
          value={stats.products.toLocaleString("fa-IR")}
          hint={`${stats.activeProducts.toLocaleString("fa-IR")} فعال`}
          icon={Package}
        />
        <AdminStatCard
          label="دسته‌بندی‌ها"
          value={stats.categories.toLocaleString("fa-IR")}
          icon={LayoutGrid}
        />
        <AdminStatCard
          label="سفارش‌ها"
          value={stats.orders.toLocaleString("fa-IR")}
          icon={ShoppingBag}
        />
        <AdminStatCard
          label="مشتریان"
          value={stats.customers.toLocaleString("fa-IR")}
          icon={Users}
        />
      </section>

      {stats.lowStock > 0 ? (
        <Card elevated className="rounded-2xl border-amber-500/30 bg-amber-500/5 p-5">
          <p className="text-sm font-semibold text-foreground">هشدار موجودی</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.lowStock.toLocaleString("fa-IR")} محصول با موجودی کم (۳ عدد یا کمتر) نیاز به بررسی دارد.
          </p>
          <Link
            href="/admin/products"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-highlight hover:underline"
          >
            مشاهده محصولات
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </Card>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">دسترسی سریع</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group block">
                <Card
                  elevated
                  className="rounded-2xl border-border/60 p-5 transition-colors group-hover:border-highlight/30"
                >
                  <CardContent className="flex items-start gap-3 p-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-highlight/20 bg-highlight/10 text-highlight">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{item.label}</p>
                      {item.description ? (
                        <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.description}</p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
