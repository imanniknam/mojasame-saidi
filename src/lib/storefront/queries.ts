import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { StoreCategory, StoreProduct } from "@/lib/storefront/types";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

const productSelect = {
  id: true,
  slug: true,
  titleFa: true,
  descriptionFa: true,
  priceMinor: true,
  compareAtMinor: true,
  isFeatured: true,
  isNew: true,
  isBestSeller: true,
  category: { select: { slug: true, nameFa: true } },
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    select: { url: true, altFa: true },
  },
  inventory: {
    select: { quantityOnHand: true, quantityReserved: true },
  },
} satisfies Prisma.ProductSelect;

type DbProduct = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

function mapProduct(product: DbProduct): StoreProduct {
  const available =
    (product.inventory?.quantityOnHand ?? 0) -
    (product.inventory?.quantityReserved ?? 0);
  const imageUrls =
    product.images.length > 0
      ? product.images.map((image) => image.url)
      : [PLACEHOLDER_IMAGE];

  return {
    id: product.id,
    slug: product.slug,
    titleFa: product.titleFa,
    descriptionFa: product.descriptionFa,
    categorySlug: product.category.slug,
    categoryNameFa: product.category.nameFa,
    priceMinor: product.priceMinor,
    compareAtMinor: product.compareAtMinor ?? undefined,
    imageUrl: imageUrls[0] ?? PLACEHOLDER_IMAGE,
    images: imageUrls,
    inStock: available > 0,
    inventoryCount: Math.max(0, available),
    specs: [],
    keywordsFa: [product.titleFa, product.category.nameFa],
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNew: product.isNew,
  };
}

export async function listStoreCategories(): Promise<StoreCategory[]> {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
    select: { slug: true, nameFa: true },
  });

  return rows.map((row) => ({
    slug: row.slug,
    nameFa: row.nameFa,
    descriptionFa: `محصولات دسته ${row.nameFa} — فروشگاه مجسمه‌سازی سعیدی`,
  }));
}

export async function listStoreProducts(): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    select: productSelect,
  });
  return rows.map(mapProduct);
}

export async function listFeaturedProducts(limit = 8): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ isFeatured: true }, { isNew: true }, { isBestSeller: true }],
    },
    orderBy: [{ isFeatured: "desc" }, { isNew: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: productSelect,
  });
  return rows.map(mapProduct);
}

export async function listProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

export async function getStoreProductBySlug(slug: string): Promise<StoreProduct | null> {
  const row = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: productSelect,
  });
  return row ? mapProduct(row) : null;
}

export async function getStoreCategoryBySlug(slug: string): Promise<StoreCategory | null> {
  const row = await prisma.category.findFirst({
    where: { slug, isActive: true },
    select: { slug: true, nameFa: true },
  });
  if (!row) return null;
  return {
    slug: row.slug,
    nameFa: row.nameFa,
    descriptionFa: `محصولات دسته ${row.nameFa} — فروشگاه مجسمه‌سازی سعیدی`,
  };
}

export async function listProductsByCategorySlug(slug: string): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, category: { slug, isActive: true } },
    orderBy: [{ isFeatured: "desc" }, { titleFa: "asc" }],
    select: productSelect,
  });
  return rows.map(mapProduct);
}

export async function getRelatedStoreProducts(
  product: StoreProduct,
  limit = 4,
): Promise<StoreProduct[]> {
  const sameCategory = await prisma.product.findMany({
    where: {
      isActive: true,
      category: { slug: product.categorySlug },
      id: { not: product.id },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: productSelect,
  });

  if (sameCategory.length >= limit) {
    return sameCategory.map(mapProduct);
  }

  const fallback = await prisma.product.findMany({
    where: { isActive: true, id: { not: product.id } },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: productSelect,
  });

  return fallback.map(mapProduct);
}
