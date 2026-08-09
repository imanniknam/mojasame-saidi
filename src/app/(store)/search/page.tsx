import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm } from "@/components/store/search-form";
import { ProductGrid } from "@/components/store/product-grid";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { safeQuery } from "@/lib/storefront/safe";
import {
  MIN_SEARCH_LENGTH,
  isSearchQueryValid,
  normalizeSearchQuery,
  searchStoreProducts,
  suggestAlternatives,
  type SearchResult,
} from "@/lib/storefront/search";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

const HINTS = ["گلدان", "تندیس", "جاشمعی", "فرشته"] as const;

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = normalizeSearchQuery(q);

  return buildPageMetadata({
    title: query ? `جستجو: ${query}` : "جستجو",
    description: query
      ? `نتایج جستجو برای «${query}» در مجسمه سعیدی.`
      : "جستجو در آثار دست‌ساز مجسمه سعیدی.",
    path: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
    noIndex: true,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = normalizeSearchQuery(q);
  const hasQuery = query.length > 0;
  const validQuery = isSearchQueryValid(query);

  const empty: SearchResult = { query, products: [], total: 0 };
  const { products, total } = validQuery
    ? await safeQuery<SearchResult>("search", () => searchStoreProducts(query), empty)
    : empty;

  const suggestions =
    validQuery && products.length === 0
      ? await safeQuery("searchSuggestions", () => suggestAlternatives(query), [])
      : [];

  const minLengthFa = new Intl.NumberFormat("fa-IR").format(MIN_SEARCH_LENGTH);

  return (
    <main className="mb-nav">
      <div className="ds-container pt-6">
        <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "جستجو" }]} />
      </div>

      <div className="ds-container py-8 lg:py-10">
        <p className="ds-overline">Search</p>
        <h1 className="ds-title mt-2 text-foreground">جستجو</h1>

        <div className="mt-6 max-w-xl">
          <SearchForm defaultQuery={query} autoFocus={!hasQuery} />
        </div>

        {/* ——— بدون پرس‌وجو ——— */}
        {!hasQuery ? (
          <section className="mt-10">
            <p className="ds-prose">نام اثر، مجموعه یا ویژگی مورد نظرتان را بنویسید.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {HINTS.map((hint) => (
                <li key={hint}>
                  <Link
                    href={`/search?q=${encodeURIComponent(hint)}`}
                    className="ds-touch-target inline-flex items-center border border-border px-4 text-sm text-muted-foreground transition-colors duration-fast hover:border-primary/50 hover:text-primary"
                  >
                    {hint}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ——— پرس‌وجوی خیلی کوتاه ——— */}
        {hasQuery && !validQuery ? (
          <p className="mt-8 border-y border-border py-4 text-sm text-muted-foreground">
            برای جستجو حداقل {minLengthFa} حرف وارد کنید.
          </p>
        ) : null}

        {/* ——— نتایج ——— */}
        {validQuery && products.length > 0 ? (
          <section className="mt-8" aria-label={`نتایج جستجو برای ${query}`}>
            <p
              data-numeric
              className="border-y border-border py-3 text-xs text-muted-foreground sm:text-sm"
            >
              {new Intl.NumberFormat("fa-IR").format(total)} نتیجه برای «
              <span className="font-semibold text-foreground">{query}</span>»
            </p>
            <div className="mt-6">
              <ProductGrid products={products} prioritizeFirst />
            </div>
          </section>
        ) : null}

        {/* ——— بدون نتیجه ——— */}
        {validQuery && products.length === 0 ? (
          <section className="mt-8">
            <div className="border border-border bg-card px-6 py-12 text-center">
              <h2 className="ds-heading text-foreground">
                نتیجه‌ای برای «{query}» پیدا نشد
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                املای دیگری را امتحان کنید یا از مجموعه‌ها شروع کنید.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="luxury" size="touch" className="px-6" asChild>
                  <Link href="/products">همه آثار</Link>
                </Button>
                <Button variant="outline" size="touch" className="px-6" asChild>
                  <Link href="/categories">مجموعه‌ها</Link>
                </Button>
              </div>
            </div>

            {suggestions.length > 0 ? (
              <div className="mt-10">
                <h2 className="ds-heading text-foreground">شاید این‌ها را می‌خواستید</h2>
                <div className="mt-5">
                  <ProductGrid products={suggestions} />
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
