import { unstable_cache } from "next/cache";
import {
  getStoreCategoryBySlug,
  getStoreProductBySlug,
  getStorefrontSettings,
  listEnabledHomepageSections,
  listHomepageProducts,
  listProductsByCategorySlug,
  listStoreCategoriesWithCounts,
  listStoreProducts,
} from "@/lib/storefront/queries";

/**
 * کش لایه‌ی داده‌ی فروشگاه.
 *
 * چرا لازم است: ریشه‌ی root layout با خواندن کوکی سشن، همه‌ی مسیرها را dynamic
 * می‌کند؛ یعنی هر بازدید (و هر prefetch مرورگر) کوئری تازه می‌زند. روی
 * Prisma Postgres با سقف اتصال پایین، چند رندر هم‌زمان pool را پر می‌کرد و
 * خطاهای P2024/P1001 می‌داد.
 *
 * کاتالوگ داده‌ای است که به‌ندرت تغییر می‌کند، پس کش کوتاه‌مدت هم بار دیتابیس را
 * حذف می‌کند و هم صفحه را سریع‌تر می‌کند.
 *
 * تگ‌ها برای این‌اند که بعداً در اکشن‌های پنل ادمین `revalidateTag` صدا زده شود
 * تا تغییر ادمین بلافاصله دیده شود؛ تا آن موقع سقف تأخیر همان REVALIDATE است.
 */
export const CACHE_TAGS = {
  products: "storefront:products",
  categories: "storefront:categories",
  homepage: "storefront:homepage",
  settings: "storefront:settings",
} as const;

const REVALIDATE = 60;

export const getCachedHomepageProducts = unstable_cache(
  listHomepageProducts,
  ["storefront-homepage-products"],
  { revalidate: REVALIDATE, tags: [CACHE_TAGS.products] },
);

export const getCachedCategoriesWithCounts = unstable_cache(
  listStoreCategoriesWithCounts,
  ["storefront-categories-with-counts"],
  { revalidate: REVALIDATE, tags: [CACHE_TAGS.categories, CACHE_TAGS.products] },
);

export const getCachedHomepageSections = unstable_cache(
  listEnabledHomepageSections,
  ["storefront-homepage-sections"],
  { revalidate: REVALIDATE, tags: [CACHE_TAGS.homepage] },
);

export const getCachedStorefrontSettings = unstable_cache(
  getStorefrontSettings,
  ["storefront-settings"],
  { revalidate: REVALIDATE, tags: [CACHE_TAGS.settings] },
);

export const getCachedAllProducts = unstable_cache(
  listStoreProducts,
  ["storefront-all-products"],
  { revalidate: REVALIDATE, tags: [CACHE_TAGS.products] },
);

export const getCachedStoreCategories = unstable_cache(
  listStoreCategoriesWithCounts,
  ["storefront-categories"],
  { revalidate: REVALIDATE, tags: [CACHE_TAGS.categories] },
);

/** کش با کلید پویا — هر اسلاگ ورودی کش مستقل خودش را دارد */
export function getCachedProductBySlug(slug: string) {
  return unstable_cache(
    () => getStoreProductBySlug(slug),
    ["storefront-product", slug],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.products] },
  )();
}

export function getCachedCategoryBySlug(slug: string) {
  return unstable_cache(
    () => getStoreCategoryBySlug(slug),
    ["storefront-category", slug],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.categories] },
  )();
}

export function getCachedProductsByCategory(slug: string) {
  return unstable_cache(
    () => listProductsByCategorySlug(slug),
    ["storefront-category-products", slug],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.products, CACHE_TAGS.categories] },
  )();
}
