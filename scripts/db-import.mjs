// واردکردن خروجی db-export.mjs به دیتابیس مقصد.
// روی سرور، بعد از اینکه schema با `prisma migrate deploy` ساخته شد:
//   DATABASE_URL="postgresql://..." node scripts/db-import.mjs db-export.json
//
// بدون CONFIRM=YES فقط گزارش می‌دهد.
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const inFile = process.argv[2] ?? "db-export.json";
const DO_IT = process.env.CONFIRM === "YES";

// همان ترتیب صادرات — والدها قبل از فرزندها، وگرنه کلید خارجی می‌شکند.
const MODEL_ORDER = [
  "user", "admin", "customer", "address", "passwordResetToken",
  "category", "product", "inventory", "productImage", "productVariant",
  "tag", "productTag", "discount", "shippingMethod",
  "order", "orderItem", "payment", "orderStatusHistory", "discountUsage",
  "wishlist", "cart", "cartItem", "review",
  "storeSettings", "homepageSection", "banner",
  "newsletterSubscriber", "contactMessage",
];

const payload = JSON.parse(readFileSync(inFile, "utf8"));
const data = payload.data ?? {};

console.log(`بسته‌ی داده: ${inFile}  (صادرشده در ${payload.exportedAt ?? "?"})\n`);

// مقصد باید خالی باشد؛ واردکردن روی داده‌ی موجود یعنی تداخل کلید.
let existing = 0;
for (const model of MODEL_ORDER) {
  if (typeof prisma[model]?.count !== "function") continue;
  existing += await prisma[model].count();
}
if (existing > 0 && !DO_IT) {
  console.log(`⚠️  مقصد خالی نیست (${existing} رکورد).`);
}

console.log("قرار است وارد شود:");
let planned = 0;
for (const model of MODEL_ORDER) {
  const rows = data[model] ?? [];
  if (rows.length) {
    console.log(`  ${String(rows.length).padStart(5)}  ${model}`);
    planned += rows.length;
  }
}
console.log(`  مجموع: ${planned}`);

if (!DO_IT) {
  console.log("\n(حالت گزارش — چیزی وارد نشد. برای اجرا: CONFIRM=YES)");
  await prisma.$disconnect();
  process.exit(0);
}

console.log("\n=== واردکردن ===");
for (const model of MODEL_ORDER) {
  const rows = data[model] ?? [];
  if (!rows.length) continue;
  if (typeof prisma[model]?.createMany !== "function") {
    console.log(`  ✗ ${model} — در کلاینت نیست`);
    continue;
  }
  // skipDuplicates یعنی اجرای دوباره‌ی اسکریپت خطا نمی‌دهد و چیزی تکراری
  // نمی‌سازد؛ پس اگر وسط کار قطع شد می‌شود دوباره اجرا کرد.
  const result = await prisma[model].createMany({ data: rows, skipDuplicates: true });
  console.log(`  ${String(result.count).padStart(5)}  ${model}`);
}

console.log("\n=== وضعیت مقصد ===");
for (const model of MODEL_ORDER) {
  if (typeof prisma[model]?.count !== "function") continue;
  const count = await prisma[model].count();
  if (count) console.log(`  ${String(count).padStart(5)}  ${model}`);
}

await prisma.$disconnect();
