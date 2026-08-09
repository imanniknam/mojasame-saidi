import type { StoreProduct } from "@/lib/storefront/types";

export const SORT_OPTIONS = [
  { value: "newest", labelFa: "جدیدترین" },
  { value: "price-asc", labelFa: "ارزان‌ترین" },
  { value: "price-desc", labelFa: "گران‌ترین" },
  { value: "discount", labelFa: "بیشترین تخفیف" },
  { value: "name", labelFa: "بر اساس نام" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "newest";

export function parseSort(raw: string | string[] | undefined): SortValue {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const match = SORT_OPTIONS.find((option) => option.value === value);
  return match ? match.value : DEFAULT_SORT;
}

function discountRatio(product: StoreProduct): number {
  if (product.compareAtMinor == null || product.compareAtMinor <= product.priceMinor) {
    return 0;
  }
  return (product.compareAtMinor - product.priceMinor) / product.compareAtMinor;
}

/**
 * مرتب‌سازی در حافظه.
 *
 * کاتالوگ کوچک است و فهرست از کش می‌آید، پس مرتب‌سازی اینجا از زدن یک کوئری
 * تازه به‌ازای هر تغییر ترتیب ارزان‌تر است. اگر کاتالوگ بزرگ شد باید به
 * orderBy در دیتابیس به‌همراه صفحه‌بندی منتقل شود.
 */
export function sortProducts(products: StoreProduct[], sort: SortValue): StoreProduct[] {
  const copy = [...products];

  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceMinor - b.priceMinor);
    case "price-desc":
      return copy.sort((a, b) => b.priceMinor - a.priceMinor);
    case "discount":
      return copy.sort((a, b) => discountRatio(b) - discountRatio(a));
    case "name":
      return copy.sort((a, b) => a.titleFa.localeCompare(b.titleFa, "fa"));
    case "newest":
    default:
      // ترتیب پیش‌فرضِ آمده از دیتابیس already بر اساس تازگی است
      return copy;
  }
}
