// فقط‌خواندنی — چیزی را عوض نمی‌کند. فهرست داده‌های آزمایشیِ کاندیدِ حذف.
// اجرا:  node --env-file=.env.local scripts/inspect-test-data.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = await prisma.product.findMany({
  where: {
    OR: [
      { slug: { contains: "test" } },
      { titleFa: { contains: "تستی" } },
      { titleFa: { contains: "آزمایشی" } },
    ],
  },
  select: {
    id: true,
    slug: true,
    titleFa: true,
    priceMinor: true,
    isActive: true,
    createdAt: true,
    _count: { select: { orderItems: true } },
  },
});

const orders = await prisma.order.findMany({
  orderBy: { createdAt: "desc" },
  take: 20,
  select: {
    id: true,
    orderNumber: true,
    status: true,
    totalMinor: true,
    createdAt: true,
    guestNameFa: true,
    guestPhone: true,
    customer: { select: { id: true, displayFa: true, user: { select: { phone: true } } } },
    items: { select: { titleFaSnap: true, quantity: true } },
    payments: { select: { provider: true, status: true } },
  },
});

const customers = await prisma.customer.findMany({
  orderBy: { createdAt: "desc" },
  take: 20,
  select: {
    id: true,
    displayFa: true,
    createdAt: true,
    user: { select: { id: true, phone: true, email: true, role: true } },
    _count: { select: { orders: true } },
  },
});

const admins = await prisma.admin.count();

console.log(`\n=== محصولات با نام/اسلاگ تستی (${products.length}) ===`);
for (const p of products) {
  console.log(
    `  ${p.slug}  |  ${p.titleFa}  |  ${p.priceMinor} تومان  |  active=${p.isActive}  |  در ${p._count.orderItems} قلم سفارش  |  ${p.createdAt.toISOString().slice(0, 16)}`,
  );
}

console.log(`\n=== ۲۰ سفارش آخر (${orders.length}) ===`);
for (const o of orders) {
  const who = o.customer?.displayFa ?? o.customer?.user?.phone ?? o.guestNameFa ?? o.guestPhone ?? "—";
  const what = o.items.map((i) => `${i.titleFaSnap}×${i.quantity}`).join("، ") || "—";
  const pay = o.payments.map((p) => `${p.provider}:${p.status}`).join(" ") || "—";
  console.log(
    `  ${o.orderNumber}  |  ${o.status}  |  ${o.totalMinor} تومان  |  ${who}  |  ${what}  |  ${pay}  |  ${o.createdAt.toISOString().slice(0, 16)}`,
  );
}

console.log(`\n=== ۲۰ مشتری آخر (${customers.length}) ===`);
for (const c of customers) {
  console.log(
    `  ${c.user?.phone ?? "—"}  |  ${c.displayFa ?? "—"}  |  ${c.user?.email ?? "بدون ایمیل"}  |  ${c._count.orders} سفارش  |  ${c.createdAt.toISOString().slice(0, 16)}`,
  );
}

console.log(`\n=== خلاصه ===`);
console.log(`  کل محصولات:  ${await prisma.product.count()}`);
console.log(`  کل سفارش‌ها: ${await prisma.order.count()}`);
console.log(`  کل مشتریان:  ${await prisma.customer.count()}`);
console.log(`  کل ادمین‌ها:  ${admins}`);

await prisma.$disconnect();
