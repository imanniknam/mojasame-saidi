import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminProductListInput } from "@/lib/validations/catalog";
import { productDetailInclude } from "./service";

export function buildProductListWhere(input: AdminProductListInput): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (input.status === "active") where.isActive = true;
  if (input.status === "inactive") where.isActive = false;

  if (input.isFeatured === "yes") where.isFeatured = true;
  if (input.isFeatured === "no") where.isFeatured = false;

  if (input.categoryId) where.categoryId = input.categoryId;

  if (input.q) {
    where.OR = [
      { titleFa: { contains: input.q, mode: "insensitive" } },
      { slug: { contains: input.q, mode: "insensitive" } },
      { sku: { contains: input.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function searchAdminProducts(input: AdminProductListInput) {
  const where = buildProductListWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip,
      take: input.limit,
      select: {
        id: true,
        titleFa: true,
        slug: true,
        sku: true,
        priceMinor: true,
        isActive: true,
        isFeatured: true,
        isNew: true,
        updatedAt: true,
        category: { select: { id: true, nameFa: true } },
        inventory: { select: { quantityOnHand: true, lowStockThreshold: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, altFa: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: input.page, limit: input.limit, totalPages: Math.max(1, Math.ceil(total / input.limit)) };
}

export async function getProductForAdminEdit(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: productDetailInclude,
  });
}

export async function listActiveCategoriesForSelect() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
    select: { id: true, nameFa: true, slug: true },
  });
}
