import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductBuyBox } from "@/components/store/product-buy-box";
import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeader } from "@/components/home/section-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getRelatedStoreProducts } from "@/lib/storefront/queries";
import { getCachedProductBySlug } from "@/lib/storefront/cached";
import { safeQuery } from "@/lib/storefront/safe";
import { buildProductJsonLd, buildProductMetadata } from "@/lib/seo/metadata";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  /**
   * generateMetadata بیرون از درخت رندر اجرا می‌شود، پس اگر پرتاب کند
   * `error.tsx` هرگز فرصت نمایش پیدا نمی‌کند و کل مسیر با بدنه‌ی خالی می‌افتد.
   * بنابراین خطا اینجا مهار می‌شود و تصمیم واقعی (۴۰۴ یا خطا) به خودِ صفحه می‌ماند.
   */
  const product = await safeQuery("productMetadata", () => getCachedProductBySlug(slug), null);

  if (!product) {
    return {
      title: "محصول",
      robots: { index: false, follow: false },
    };
  }
  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedStoreProducts(product);

  return (
    <>
      <JsonLd data={buildProductJsonLd(product)} />

      <main className="mb-nav">
        <div className="ds-container pt-6">
          <Breadcrumbs
            items={[
              { label: "خانه", href: "/" },
              { label: product.categoryNameFa, href: `/categories/${product.categorySlug}` },
              { label: product.titleFa },
            ]}
          />
        </div>

        <div className="ds-container grid gap-8 py-8 lg:grid-cols-2 lg:items-start lg:gap-12 lg:py-12">
          <ProductGallery
            images={product.images}
            titleFa={product.titleFa}
            categoryFa={product.categoryNameFa}
          />

          <div className="flex flex-col">
            <p className="ds-overline-fa">{product.categoryNameFa}</p>

            <h1 className="ds-title mt-2 text-foreground">{product.titleFa}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={
                  product.inStock
                    ? "border border-primary/40 px-2 py-1 text-[0.6875rem] font-semibold text-primary"
                    : "border border-destructive/50 px-2 py-1 text-[0.6875rem] font-semibold text-destructive"
                }
              >
                {product.inStock ? "موجود" : "ناموجود"}
              </span>
              {product.isNew ? (
                <span className="border border-border px-2 py-1 text-[0.6875rem] font-semibold text-muted-foreground">
                  جدید
                </span>
              ) : null}
              {product.isBestSeller ? (
                <span className="border border-border px-2 py-1 text-[0.6875rem] font-semibold text-muted-foreground">
                  پرفروش
                </span>
              ) : null}
            </div>

            <hr className="ds-rule my-6" />

            <ProductBuyBox
              productId={product.id}
              titleFa={product.titleFa}
              priceMinor={product.priceMinor}
              compareAtMinor={product.compareAtMinor}
              imageUrl={product.imageUrl}
              inStock={product.inStock}
              variants={product.variants}
              slug={product.slug}
            />

            {product.descriptionFa ? (
              <section className="mt-8">
                <h2 className="ds-heading text-foreground">توضیحات</h2>
                <p className="ds-prose mt-3 whitespace-pre-line">{product.descriptionFa}</p>
              </section>
            ) : null}

            {product.specs.length ? (
              <section className="mt-8">
                <h2 className="ds-heading text-foreground">مشخصات</h2>
                <dl className="mt-3 divide-y divide-border border-y border-border">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.labelFa}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <dt className="text-muted-foreground">{spec.labelFa}</dt>
                      <dd className="font-medium text-foreground">{spec.valueFa}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>
        </div>

        {related.length ? (
          <section className="ds-container ds-section border-t border-border">
            <SectionHeader
              titleFa="آثار مرتبط"
              overline="You may also like"
              linkHref={`/categories/${product.categorySlug}`}
              linkLabel="مشاهده دسته"
            />
            <ProductGrid products={related} />
          </section>
        ) : null}
      </main>
    </>
  );
}
