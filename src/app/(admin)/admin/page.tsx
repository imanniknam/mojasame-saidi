import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActiveSessionUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const user = await getActiveSessionUser();
  if (user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const [products, categories, activeProducts, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.inventory.count({
      where: {
        quantityOnHand: { lte: 3 },
      },
    }),
  ]);

  const stats = [
    { label: "کل محصولات", value: products.toLocaleString("fa-IR") },
    { label: "محصولات فعال", value: activeProducts.toLocaleString("fa-IR") },
    { label: "دسته‌بندی‌ها", value: categories.toLocaleString("fa-IR") },
    { label: "نیازمند بررسی موجودی", value: lowStock.toLocaleString("fa-IR") },
  ];

  return (
    <main className="ds-section min-h-dvh">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-highlight/15 bg-card/70 p-6 shadow-float sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 text-start">
            <Badge variant="highlight" className="border border-highlight/30">
              پنل مدیریت
            </Badge>
            <h1 className="ds-display text-foreground">داشبورد فروشگاه</h1>
            <p className="ds-body max-w-2xl text-muted-foreground">
              ورود شما با نقش مدیر تایید شد. APIهای کاتالوگ، دسته‌بندی و آپلود آماده اتصال به UI ادمین هستند.
            </p>
          </div>
          <Button variant="outline" size="touch" asChild>
            <Link href="/admin/logout">خروج امن</Link>
          </Button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} elevated className="rounded-3xl p-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-3 text-3xl font-black text-highlight">{stat.value}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "API محصولات",
              body: "GET/POST /api/admin/products و PATCH/DELETE با شناسه محصول فعال است.",
            },
            {
              title: "API دسته‌بندی",
              body: "مدیریت دسته‌ها با اعتبارسنجی اسلاگ، ترتیب نمایش و وضعیت فعال انجام می‌شود.",
            },
            {
              title: "آپلود تصویر",
              body: "مسیر آپلود فعلاً اعتبارسنجی امن انجام می‌دهد و URL placeholder برمی‌گرداند.",
            },
          ].map((item) => (
            <Card key={item.title} elevated className="rounded-3xl p-5 text-start">
              <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
