import { getCachedAllProducts } from "@/lib/storefront/cached";
import { normalizeFa, tokenizeFa } from "@/lib/storefront/persian";
import type { StoreProduct } from "@/lib/storefront/types";

export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_RESULTS = 48;

export function normalizeSearchQuery(raw: string | undefined | null): string {
  return (raw ?? "").trim().replace(/\s+/g, " ");
}

export function isSearchQueryValid(query: string): boolean {
  return normalizeFa(query).length >= MIN_SEARCH_LENGTH;
}

/**
 * امتیازدهی یک محصول نسبت به واژه‌های پرس‌وجو.
 *
 * چرا در حافظه و نه در دیتابیس: `contains` پستگرس روی متن خام کار می‌کند، پس
 * «كتاب» با کاف عربی هرگز «کتاب» فارسی را پیدا نمی‌کرد. برای رفع این باید یا
 * ستون نرمال‌شده نگه داشت یا pg_trgm/unaccent راه انداخت. کاتالوگ کوچک است و
 * فهرست از کش می‌آید، پس فعلاً امتیازدهی اینجا هم درست‌تر است هم ساده‌تر.
 *
 * اگر کاتالوگ بزرگ شد: یک ستون `searchText` نرمال‌شده در دیتابیس + ایندکس GIN.
 */
function scoreProduct(product: StoreProduct, tokens: string[]): number {
  const title = normalizeFa(product.titleFa);
  const category = normalizeFa(product.categoryNameFa);
  const description = normalizeFa(product.descriptionFa);
  const slug = normalizeFa(product.slug);

  let score = 0;

  for (const token of tokens) {
    let tokenScore = 0;

    if (title === token) tokenScore = 100;
    else if (title.startsWith(token)) tokenScore = 60;
    else if (title.includes(token)) tokenScore = 40;
    else if (category.includes(token)) tokenScore = 25;
    else if (slug.includes(token)) tokenScore = 15;
    else if (description.includes(token)) tokenScore = 10;

    // واژه‌ای که اصلاً پیدا نشود کل نتیجه را رد می‌کند (AND، نه OR)
    if (tokenScore === 0) return 0;

    score += tokenScore;
  }

  // ترجیح جزئی به آثار شاخص، فقط به‌عنوان تفکیک‌کننده‌ی مساوی‌ها
  if (product.isFeatured) score += 3;
  if (product.isBestSeller) score += 2;

  return score;
}

export type SearchResult = {
  query: string;
  products: StoreProduct[];
  total: number;
};

export async function searchStoreProducts(rawQuery: string): Promise<SearchResult> {
  const query = normalizeSearchQuery(rawQuery);
  const tokens = tokenizeFa(query);

  if (!isSearchQueryValid(query) || tokens.length === 0) {
    return { query, products: [], total: 0 };
  }

  const all = await getCachedAllProducts();

  const ranked = all
    .map((product) => ({ product, score: scoreProduct(product, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.titleFa.localeCompare(b.product.titleFa, "fa"));

  return {
    query,
    products: ranked.slice(0, MAX_SEARCH_RESULTS).map((entry) => entry.product),
    total: ranked.length,
  };
}

/** پیشنهاد دسته‌ها وقتی جستجو نتیجه‌ای ندارد — راه خروج به‌جای بن‌بست */
export async function suggestAlternatives(rawQuery: string, limit = 4): Promise<StoreProduct[]> {
  const tokens = tokenizeFa(rawQuery);
  if (tokens.length === 0) return [];

  const all = await getCachedAllProducts();

  // تطبیق جزئی: کافی است یکی از واژه‌ها جایی پیدا شود (OR به‌جای AND)
  const loose = all.filter((product) => {
    const haystack = normalizeFa(
      `${product.titleFa} ${product.categoryNameFa} ${product.descriptionFa}`,
    );
    return tokens.some((token) => haystack.includes(token.slice(0, 3)));
  });

  return loose.slice(0, limit);
}
