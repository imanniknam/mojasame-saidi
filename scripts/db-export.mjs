// صادرات کل داده‌ها به JSON — فقط‌خواندنی.
// از کامپیوتری اجرا شود که به دیتابیس فعلی دسترسی پایدار دارد:
//   node --env-file=.env.local scripts/db-export.mjs [خروجی.json]
import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const outFile = process.argv[2] ?? "db-export.json";

/**
 * ترتیب، همان ترتیبِ امنِ کلید خارجی برای واردات است.
 * هر مدل تازه‌ای که به schema اضافه شود باید اینجا هم اضافه شود، وگرنه
 * بی‌صدا از انتقال جا می‌ماند.
 */
export const MODEL_ORDER = [
  "user",
  "admin",
  "customer",
  "address",
  "passwordResetToken",
  "category",
  "product",
  "inventory",
  "productImage",
  "productVariant",
  "tag",
  "productTag",
  "discount",
  "shippingMethod",
  "order",
  "orderItem",
  "payment",
  "orderStatusHistory",
  "discountUsage",
  "wishlist",
  "cart",
  "cartItem",
  "review",
  "storeSettings",
  "homepageSection",
  "banner",
  "newsletterSubscriber",
  "contactMessage",
];

const data = {};
let total = 0;

for (const model of MODEL_ORDER) {
  if (typeof prisma[model]?.findMany !== "function") {
    console.log(`  ✗ ${model} — در کلاینت Prisma نیست، رد شد`);
    continue;
  }
  const rows = await prisma[model].findMany();
  data[model] = rows;
  total += rows.length;
  console.log(`  ${String(rows.length).padStart(5)}  ${model}`);
}

writeFileSync(
  outFile,
  JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2),
  "utf8",
);

console.log(`\nمجموع ${total} رکورد در ${outFile}`);
console.log("⚠️  این فایل ایمیل و شماره‌ی مشتریان را دارد — کامیت نکنید و بعد از انتقال پاکش کنید.");

await prisma.$disconnect();
