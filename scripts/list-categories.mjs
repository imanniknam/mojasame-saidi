import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const cats = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, nameFa: true } });
console.log(JSON.stringify(cats, null, 2));
const productCount = await prisma.product.count();
console.log("total products:", productCount);
await prisma.$disconnect();
