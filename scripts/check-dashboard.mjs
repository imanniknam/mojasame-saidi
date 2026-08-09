// اجرای مستقیم کوئری‌های داشبورد برای پیدا کردن خطا
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function step(name, fn) {
  try {
    const r = await fn();
    console.log(`OK   ${name}:`, JSON.stringify(r));
  } catch (e) {
    console.log(`FAIL ${name}: ${e.constructor.name}`);
    console.log("      " + String(e.message).split("\n").filter(Boolean).slice(0, 4).join("\n      "));
  }
}

await step("product.count", () => prisma.product.count());
await step("category.count", () => prisma.category.count());
await step("inventory.lowStock", () =>
  prisma.inventory.count({ where: { quantityOnHand: { lte: 3 } } }),
);
await step("order.count", () => prisma.order.count());
await step("customer.count", () => prisma.customer.count());
await step("order.openOrders", () =>
  prisma.order.count({
    where: { status: { in: ["AWAITING_PAYMENT", "PAID", "PROCESSING"] } },
  }),
);
await step("order.revenueAggregate", () =>
  prisma.order.aggregate({
    _sum: { totalMinor: true },
    where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
  }),
);
await step("listRecentOrders", () =>
  prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalMinor: true,
      createdAt: true,
      guestNameFa: true,
      customer: { select: { displayFa: true } },
    },
  }),
);
await step("admin.displayName", () =>
  prisma.admin.findFirst({ select: { displayName: true } }),
);

await prisma.$disconnect();
