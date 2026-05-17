import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/product-card";
import { formatPriceFa } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getStoreCategoryBySlug,
  listProductsByCategorySlug,
  listStoreCategories,
} from "@/lib/storefront/queries";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = await listStoreCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getStoreCategoryBySlug(slug);
  if (!category) {
    return {
      title: "دسته‌بندی پیدا نشد",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: `${category.nameFa} دست‌ساز`,
    description: category.descriptionFa,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getStoreCategoryBySlug(slug);
  if (!category) notFound();

  const products = await listProductsByCategorySlug(category.slug);

  return (
    <main className="ds-section mx-auto max-w-6xl space-y-8 pb-28">
      <nav className="text-start text-sm text-muted-foreground" aria-label="مسیر صفحه">
        <Link href="/" className="hover:text-highlight">
          خانه
        </Link>
        <span className="px-2">/</span>
        <Link href="/categories" className="hover:text-highlight">
          دسته‌بندی‌ها
        </Link>
      </nav>

      <header className="space-y-2 text-start">
        <p className="ds-overline">دسته محصول</p>
        <h1 className="ds-display text-3xl">{category.nameFa}</h1>
        <p className="ds-subtitle max-w-2xl">{category.descriptionFa}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
    </main>
  );
}
