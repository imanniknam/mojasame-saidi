/**
 * پاک‌سازی کاتالوگ نمونه.
 *
 * همه‌ی محصولات و سفارش‌های آزمایشی را حذف می‌کند تا فروشنده از پنل ادمین
 * کاتالوگ واقعی را وارد کند. دسته‌بندی‌ها، تنظیمات فروشگاه، بخش‌های صفحه اصلی
 * و حساب‌های کاربری دست‌نخورده می‌مانند.
 *
 * بدون آرگومان فقط گزارش می‌دهد. برای اجرای واقعی: node scripts/purge-catalog.mjs --confirm
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CONFIRMED = process.argv.includes("--confirm");

const before = {
  product: await prisma.product.count(),
  productImage: await prisma.productImage.count(),
  productVariant: await prisma.productVariant.count(),
  inventory: await prisma.inventory.count(),
  order: await prisma.order.count(),
  orderItem: await prisma.orderItem.count(),
  payment: await prisma.payment.count(),
  wishlist: await prisma.wishlist.count(),
  cartItem: await prisma.cartItem.count(),
  review: await prisma.review.count(),
  category: await prisma.category.count(),
};

console.log("---- BEFORE ----");
console.table(before);

if (!CONFIRMED) {
  console.log("\nDRY RUN — nothing deleted. Pass --confirm to execute.");
  await prisma.$disconnect();
  process.exit(0);
}

/**
 * ترتیب مهم است. Payment و OrderItem با حذف Order آبشاری پاک می‌شوند، ولی
 * Order باید پیش از Product برود چون OrderItem→Product روی Restrict است.
 * ProductImage / Inventory / ProductVariant / Review / Wishlist با حذف Product
 * آبشاری پاک می‌شوند.
 */
await prisma.$transaction(async (tx) => {
  await tx.order.deleteMany({});
  await tx.cartItem.deleteMany({});
  await tx.product.deleteMany({});
});

const after = {
  product: await prisma.product.count(),
  productImage: await prisma.productImage.count(),
  productVariant: await prisma.productVariant.count(),
  inventory: await prisma.inventory.count(),
  order: await prisma.order.count(),
  orderItem: await prisma.orderItem.count(),
  payment: await prisma.payment.count(),
  wishlist: await prisma.wishlist.count(),
  cartItem: await prisma.cartItem.count(),
  review: await prisma.review.count(),
  category: await prisma.category.count(),
};

console.log("\n---- AFTER ----");
console.table(after);

await prisma.$disconnect();
