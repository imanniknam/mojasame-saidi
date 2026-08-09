// پشتیبان کامل و فقط‌خواندنی از داده‌های کاتالوگ و سفارش‌ها، پیش از هر حذفی.
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dir = path.resolve("backups");
await mkdir(dir, { recursive: true });

const data = {
  takenAt: new Date().toISOString(),
  products: await prisma.product.findMany({
    include: { images: true, inventory: true, variants: true, category: { select: { slug: true } } },
  }),
  categories: await prisma.category.findMany(),
  orders: await prisma.order.findMany({ include: { items: true, payments: true } }),
  discounts: await prisma.discount.findMany(),
  banners: await prisma.banner.findMany(),
  homepageSections: await prisma.homepageSection.findMany(),
  storeSettings: await prisma.storeSettings.findUnique({ where: { id: 1 } }),
};

const file = path.join(dir, `backup-${stamp}.json`);
await writeFile(file, JSON.stringify(data, null, 2), "utf8");

console.log(`backup written: ${file}`);
for (const [key, value] of Object.entries(data)) {
  if (Array.isArray(value)) console.log(`  ${key}: ${value.length}`);
}

await prisma.$disconnect();
