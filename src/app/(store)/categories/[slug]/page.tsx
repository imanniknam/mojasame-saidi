import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { EmptyState } from "@/components/store/empty-state";
import { ListingToolbar } from "@/components/store/listing-toolbar";
import { ProductGrid } from "@/components/store/product-grid";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getCachedCategoryBySlug,
  getCachedProductsByCategory,
} from "@/lib/storefront/cached";
import { parseSort, sortProducts } from "@/lib/storefront/sort";
import { safeQuery } from "@/lib/storefront/safe";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  // مثل صفحه‌ی محصول: پرتاب در generateMetadata کل مسیر را می‌اندازد،
  // پس اینجا مهار می‌شود و تصمیم ۴۰۴ به خودِ صفحه واگذار می‌شود.
  const category = await safeQuery(
    "categoryMetadata",
    () => getCachedCategoryBySlug(slug),
    null,
  );

  if (!category) {
    return {
      title: "مجموعه",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: `${category.nameFa} دست‌ساز`,
    description: category.descriptionFa,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, { sort: rawSort }] = await Promise.all([params, searchParams]);
  const sort = parseSort(rawSort);

  const category = await getCachedCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getCachedProductsByCategory(category.slug);
  const sorted = sortProducts(products, sort);

  return (
    <main className="mb-nav">
      <div className="ds-container pt-6">
        <Breadcrumbs
          items={[
            { label: "خانه", href: "/" },
            { label: "مجموعه‌ها", href: "/categories" },
            { label: category.nameFa },
          ]}
        />
      </div>

      <div className="ds-container py-8 lg:py-10">
        <p className="ds-overline-fa">مجموعه</p>
        <h1 className="ds-title mt-2 text-foreground">{category.nameFa}</h1>
        <p className="ds-prose mt-3">{category.descriptionFa}</p>

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
              titleFa={`هنوز اثری در «${category.nameFa}» ثبت نشده`}
              descriptionFa="می‌توانید مجموعه‌های دیگر یا همه‌ی آثار را ببینید."
              ctaHref="/products"
              ctaLabel="مشاهده همه آثار"
            />
          )}
        </div>
      </div>
    </main>
  );
}
