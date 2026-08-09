import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { EmptyState } from "@/components/store/empty-state";
import { ListingToolbar } from "@/components/store/listing-toolbar";
import { ProductGrid } from "@/components/store/product-grid";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCachedAllProducts } from "@/lib/storefront/cached";
import { parseSort, sortProducts } from "@/lib/storefront/sort";
import { safeQuery } from "@/lib/storefront/safe";

export const metadata: Metadata = buildPageMetadata({
  title: "همه آثار",
  description:
    "خرید محصولات دست‌ساز و دکوراتیو مجسمه سعیدی؛ مجسمه، تندیس، گلدان، جاشمعی و دکور هنری.",
  path: "/products",
});

type ProductsPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { sort: rawSort } = await searchParams;
  const sort = parseSort(rawSort);

  const products = await safeQuery("allProducts", getCachedAllProducts, []);
  const sorted = sortProducts(products, sort);

  return (
    <main className="mb-nav">
      <div className="ds-container pt-6">
        <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "همه آثار" }]} />
      </div>

      <div className="ds-container py-8 lg:py-10">
        <p className="ds-overline">Shop</p>
        <h1 className="ds-title mt-2 text-foreground">همه آثار</h1>
        <p className="ds-prose mt-3">
          انتخابی از مجسمه‌ها و دکورهای دست‌ساز برای خانه و فضای کاری.
        </p>

        <div className="mt-8">
          {sorted.length > 0 ? (
            <>
              <ListingToolbar total={sorted.length} sort={sort} />
              <div className="mt-6">
                <ProductGrid products={sorted} prioritizeFirst />
              </div>
            </>
          ) : (
            <EmptyState
              titleFa="فعلاً اثری برای نمایش نیست"
              descriptionFa="به‌زودی آثار تازه اضافه می‌شوند. می‌توانید مجموعه‌ها را ببینید."
              ctaHref="/categories"
              ctaLabel="مشاهده مجموعه‌ها"
            />
          )}
        </div>
      </div>
    </main>
  );
}
