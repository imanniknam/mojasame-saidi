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
  variants: {
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }],
    select: { id: true, nameFa: true, priceMinor: true, compareAtMinor: true },
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
    variants: product.variants.map((v) => ({
      id: v.id,
      nameFa: v.nameFa,
      priceMinor: v.priceMinor,
      compareAtMinor: v.compareAtMinor ?? undefined,
    })),
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

/** دسته‌ها به‌همراه تعداد محصولات فعال — برای کارت مجموعه در صفحه اصلی */
export async function listStoreCategoriesWithCounts(): Promise<
  (StoreCategory & { count: number })[]
> {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
    select: {
      slug: true,
      nameFa: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  return rows.map((row) => ({
    slug: row.slug,
    nameFa: row.nameFa,
    descriptionFa: `محصولات دسته ${row.nameFa} — فروشگاه مجسمه‌سازی سعیدی`,
    count: row._count.products,
  }));
}

/** بخش‌های فعال صفحه اصلی، به ترتیب — کنترل‌شده از پنل ادمین */
export async function listEnabledHomepageSections() {
  return prisma.homepageSection.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: "asc" },
    select: { key: true, titleFa: true, subtitleFa: true, config: true },
  });
}

/** تنظیمات فروشگاه — زیرمجموعه‌ی امن برای نمایش در فروشگاه */
export async function getStorefrontSettings() {
  return prisma.storeSettings.findUnique({
    where: { id: 1 },
    select: {
      brandNameFa: true,
      taglineFa: true,
      trustBadges: true,
      supportPhone: true,
      supportEmail: true,
      socialLinks: true,
    },
  });
}

/**
 * محصولات لازم برای ترکیب صفحه‌ی اصلی — در یک کوئری.
 *
 * قبلاً برای «منتخب»، «پرفروش»، «تازه‌ها» و «تخفیف‌ها» چهار کوئری جدا زده می‌شد.
 * روی Prisma Postgres با سقف اتصال پایین، هم‌زمانیِ آن کوئری‌ها باعث P2024
 * (پر شدن connection pool) و بعد P1001 می‌شد. کاتالوگ کوچک است، پس یک‌بار
 * می‌خوانیم و بخش‌ها را در حافظه می‌سازیم.
 *
 * اگر روزی کاتالوگ از این سقف بگذرد، باید به کوئری‌های اختصاصی با ایندکس برگردیم.
 */
const HOMEPAGE_PRODUCT_POOL = 100;

export async function listHomepageProducts(): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: HOMEPAGE_PRODUCT_POOL,
    select: productSelect,
  });
  return rows.map(mapProduct);
}

export function selectFeatured(products: StoreProduct[], limit = 8): StoreProduct[] {
  return products
    .filter((p) => p.isFeatured || p.isNew || p.isBestSeller)
    .slice(0, limit);
}

export function selectBestSellers(products: StoreProduct[], limit = 8): StoreProduct[] {
  return products.filter((p) => p.isBestSeller).slice(0, limit);
}

export function selectNewArrivals(products: StoreProduct[], limit = 8): StoreProduct[] {
  return products.filter((p) => p.isNew).slice(0, limit);
}

/** فقط محصولاتی که قیمت خط‌خورده‌شان واقعاً از قیمت فعلی بیشتر است */
export function selectDiscounted(products: StoreProduct[], limit = 8): StoreProduct[] {
  return products
    .filter((p) => p.compareAtMinor != null && p.compareAtMinor > p.priceMinor)
    .slice(0, limit);
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

/**
 * جستجو عمداً اینجا نیست.
 * منطق آن در `@/lib/storefront/search` است، چون به نرمال‌سازی فارسی نیاز دارد
 * که با `contains` پستگرس روی متن خام قابل انجام نبود («كتاب» عربی هرگز
 * «کتاب» فارسی را پیدا نمی‌کرد).
 */

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
