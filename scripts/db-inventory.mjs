// READ-ONLY inventory of the live database. Performs no writes.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const counts = {};
for (const model of [
  "user",
  "customer",
  "admin",
  "category",
  "product",
  "productImage",
  "productVariant",
  "inventory",
  "order",
  "orderItem",
  "payment",
  "cart",
  "review",
  "discount",
  "shippingMethod",
  "banner",
  "homepageSection",
  "newsletterSubscriber",
  "contactMessage",
]) {
  try {
    counts[model] = await prisma[model].count();
  } catch (err) {
    counts[model] = `ERROR: ${err.message.split("\n")[0]}`;
  }
}
console.log("---- ROW COUNTS ----");
console.table(counts);

const images = await prisma.productImage.groupBy({
  by: ["url"],
  _count: { url: true },
});
console.log("---- DISTINCT PRODUCT IMAGE URLS ----");
console.log(images.length ? images : "(none — products have no image rows at all)");

const settings = await prisma.storeSettings.findFirst();
console.log("---- STORE SETTINGS ----");
console.log(settings ?? "(none)");

const sections = await prisma.homepageSection.findMany({
  select: { key: true, titleFa: true, isEnabled: true, sortOrder: true },
  orderBy: { sortOrder: "asc" },
});
console.log("---- HOMEPAGE SECTIONS ----");
console.log(sections.length ? sections : "(none)");

await prisma.$disconnect();
