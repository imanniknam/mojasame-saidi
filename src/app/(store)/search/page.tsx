import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm } from "@/components/store/search-form";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { formatPriceFa } from "@/lib/format";
import {
  isSearchQueryValid,
  normalizeSearchQuery,
  searchStoreProducts,
} from "@/lib/storefront/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = normalizeSearchQuery(q);

  if (!query) {
    return buildPageMetadata({
      title: "جستجو",
      description: "جستجو در محصولات دست‌ساز فروشگاه مجسمه‌سازی سعیدی.",
      path: "/search",
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `جستجو: ${query}`,
    description: `نتایج جستجو برای «${query}» در فروشگاه مجسمه‌سازی سعیدی.`,
    path: `/search?q=${encodeURIComponent(query)}`,
    noIndex: true,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = normalizeSearchQuery(q);
  const hasQuery = query.length > 0;
  const validQuery = isSearchQueryValid(query);

  const { products, total } = validQuery
    ? await searchStoreProducts(query)
    : { products: [], total: 0 };

  return (
    <main className="ds-section mx-auto max-w-6xl space-y-6 pb-28">
      <header className="space-y-4 text-start">
        <div className="space-y-2">
          <p className="ds-overline">فروشگاه</p>
          <h1 className="ds-display text-3xl">جستجو</h1>
          {hasQuery && validQuery ? (
            <p className="ds-subtitle">
              {total > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{total.toLocaleString("fa-IR")}</span>{" "}
                  نتیجه برای «<span className="font-semibold text-foreground">{query}</span>»
                  {products.length < total ? (
                    <span className="text-muted-foreground">
                      {" "}
                      (نمایش {products.length.toLocaleString("fa-IR")} مورد اول)
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  نتیجه‌ای برای «<span className="font-semibold text-foreground">{query}</span>» پیدا
                  نشد.
                </>
              )}
            </p>
          ) : (
            <p className="ds-subtitle max-w-2xl">
              نام محصول، دسته‌بندی یا ویژگی را جستجو کنید.
            </p>
          )}
        </div>
        <SearchForm defaultQuery={query} autoFocus={!hasQuery} />
      </header>

      {!hasQuery ? (
        <section className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            مثلاً «گلدان»، «تندیس»، «جاشمعی» یا «فرشته» را امتحان کنید.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["گلدان", "تندیس", "جاشمعی"].map((hint) => (
              <Button key={hint} variant="outline" size="sm" asChild>
                <Link href={`/search?q=${encodeURIComponent(hint)}`}>{hint}</Link>
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {hasQuery && !validQuery ? (
        <section className="rounded-2xl border border-border/70 bg-muted/25 p-6 text-center text-sm text-muted-foreground">
          برای جستجو حداقل ۲ حرف وارد کنید.
        </section>
      ) : null}

      {validQuery && products.length > 0 ? (
        <section
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          aria-label={`نتایج جستجو برای ${query}`}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              href={`/products/${product.slug}`}
              productId={product.id}
              titleFa={product.titleFa}
              imageUrl={product.imageUrl}
              priceMinor={product.priceMinor}
              compareAtMinor={product.compareAtMinor}
              priceLabel={formatPriceFa(product.priceMinor)}
              compareAtLabel={
                product.compareAtMinor ? formatPriceFa(product.compareAtMinor) : null
              }
              badge={product.isNew ? "جدید" : product.isBestSeller ? "پرفروش" : null}
            />
          ))}
        </section>
      ) : null}

      {validQuery && products.length === 0 ? (
        <section className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-8 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            عبارت دیگری امتحان کنید یا از دسته‌بندی‌ها محصول را پیدا کنید.
          </p>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Button variant="luxury" size="touch" asChild>
              <Link href="/products">همه محصولات</Link>
            </Button>
            <Button variant="outline" size="touch" asChild>
              <Link href="/categories">دسته‌بندی‌ها</Link>
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
