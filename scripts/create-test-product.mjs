// محصول تستی برای بررسی مسیر کامل خرید و پرداخت زرین‌پال — قیمت واقعی ۱۰,۰۰۰ تومان.
// عمداً عنوانش «تستی» است تا با محصولات واقعی اشتباه گرفته نشود.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const category = await prisma.category.findUnique({ where: { slug: "shamdan" } });
if (!category) throw new Error("دسته shamdan پیدا نشد");

const product = await prisma.product.upsert({
  where: { slug: "test-10000-toman" },
  create: {
    slug: "test-10000-toman",
    titleFa: "محصول تستی – ۱۰,۰۰۰ تومان",
    descriptionFa:
      "این یک محصول تستی است که فقط برای بررسی کارکرد سبد خرید و درگاه پرداخت زرین‌پال ساخته شده. لطفاً سفارش نمی‌دهید مگر برای تست.",
    priceMinor: 10000,
    isActive: true,
    categoryId: category.id,
    inventory: { create: { quantityOnHand: 99 } },
  },
  update: {
    priceMinor: 10000,
    isActive: true,
    inventory: { update: { quantityOnHand: 99 } },
  },
  include: { inventory: true, category: true },
});

console.log("محصول ساخته/به‌روزرسانی شد:");
console.log(JSON.stringify(product, null, 2));

await prisma.$disconnect();
