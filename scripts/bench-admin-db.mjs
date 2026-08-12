// اندازه‌گیری هزینه‌ی واقعی کوئری‌های پنل ادمین — فقط‌خواندنی.
// اجرا: node --env-file=.env.local scripts/bench-admin-db.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ transactionOptions: { timeout: 20_000, maxWait: 10_000 } });

async function time(label, fn) {
  const start = Date.now();
  let note = "";
  try {
    const out = await fn();
    if (typeof out === "number") note = ` (${out})`;
  } catch (error) {
    note = `  ✗ ${error.constructor.name}: ${String(error.message).split("\n").find((l) => l.trim())}`;
  }
  const ms = Date.now() - start;
  console.log(`  ${String(ms).padStart(6)} ms  ${label}${note}`);
  return ms;
}

console.log("\n=== یک رفت‌وبرگشت ساده ===");
for (let i = 0; i < 5; i += 1) {
  await time("SELECT 1", () => prisma.$queryRaw`SELECT 1`);
}

console.log("\n=== آمار داشبورد (۸ کوئری موازی) ===");
await time("getAdminDashboardStats", async () => {
  const [a, b, c, d, e, f, g, h] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.inventory.count({ where: { quantityOnHand: { lte: 3 } } }),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.count({ where: { status: { in: ["AWAITING_PAYMENT", "PAID", "PROCESSING"] } } }),
    prisma.order.aggregate({ _sum: { totalMinor: true }, where: { status: { in: ["PAID"] } } }),
  ]);
  return a + b + c + d + e + f + g + (h._sum.totalMinor ?? 0);
});

console.log("\n=== همان آمار در یک کوئری خام ===");
await time("dashboard stats — single SQL", async () => {
  const rows = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*) FROM "Product")::int AS products,
      (SELECT COUNT(*) FROM "Category")::int AS categories,
      (SELECT COUNT(*) FROM "Product" WHERE "isActive")::int AS active_products,
      (SELECT COUNT(*) FROM "Inventory" WHERE "quantityOnHand" <= 3)::int AS low_stock,
      (SELECT COUNT(*) FROM "Order")::int AS orders,
      (SELECT COUNT(*) FROM "Customer")::int AS customers
  `;
  return rows.length;
});

console.log("\n=== تراکنش با ۷ کوئری پشت‌سرهم (شکل ذخیره‌ی محصول) ===");
await time("transaction × 7 sequential", () =>
  prisma.$transaction(async (tx) => {
    for (let i = 0; i < 7; i += 1) await tx.$queryRaw`SELECT 1`;
    return 7;
  }),
);

console.log("\n=== صفحه‌ی ویرایش محصول ===");
const anyProduct = await prisma.product.findFirst({ select: { id: true } });
if (anyProduct) {
  await time("getProductForAdminEdit + categories (موازی)", async () => {
    await Promise.all([
      prisma.product.findUnique({
        where: { id: anyProduct.id },
        include: {
          category: true,
          inventory: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: { orderBy: { sortOrder: "asc" } },
        },
      }),
      prisma.category.findMany({ where: { isActive: true }, select: { id: true, nameFa: true } }),
    ]);
    return 2;
  });
}

console.log("");
await prisma.$disconnect();
