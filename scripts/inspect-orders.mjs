// بازرسی سفارش‌ها پیش از هر حذفی — فقط خواندنی
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const orders = await prisma.order.findMany({
  orderBy: { createdAt: "asc" },
  select: {
    id: true,
    orderNumber: true,
    status: true,
    totalMinor: true,
    createdAt: true,
    customer: { select: { displayFa: true, user: { select: { email: true } } } },
    items: { select: { titleFaSnap: true, productId: true } },
    payments: { select: { provider: true, status: true } },
  },
});

console.log("---- ORDERS ----");
for (const o of orders) {
  console.log(
    [
      o.orderNumber ?? o.id.slice(0, 8),
      o.status,
      o.totalMinor.toLocaleString("en-US"),
      o.createdAt.toISOString().slice(0, 16),
      o.customer?.user?.email ?? "(guest)",
      o.items.map((i) => i.titleFaSnap).join(" | "),
      o.payments.map((p) => `${p.provider}:${p.status}`).join(","),
    ].join("  ·  "),
  );
}

const referenced = await prisma.orderItem.findMany({
  select: { productId: true },
  distinct: ["productId"],
});
const total = await prisma.product.count();

console.log("\n---- IMPACT OF DELETING ALL PRODUCTS ----");
console.log(`products total:                              ${total}`);
console.log(`referenced by orders (hard-delete blocked):  ${referenced.length}`);
console.log(`safe to hard-delete:                         ${total - referenced.length}`);

await prisma.$disconnect();
