import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/store/product-card";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { JsonLd } from "@/components/seo/json-ld";
import { formatPriceFa } from "@/lib/format";
import { IMAGE_SIZES } from "@/lib/images";
import {
  getRelatedStoreProducts,
  getStoreProductBySlug,
  listProductSlugs,
} from "@/lib/storefront/queries";
import { buildProductJsonLd, buildProductMetadata } from "@/lib/seo/metadata";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await listProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) {
    return {
      title: "محصول پیدا نشد",
      robots: { index: false, follow: false },
    };
  }
  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedStoreProducts(product);
  const hasDiscount =
    product.compareAtMinor != null && product.compareAtMinor > product.priceMinor;

  return (
    <>
      <JsonLd data={buildProductJsonLd(product)} />
      <main className="ds-section mx-auto max-w-6xl space-y-12 pb-28">
        <nav className="text-start text-sm text-muted-foreground" aria-label="مسیر صفحه">
          <Link href="/" className="hover:text-highlight">
            خانه
          </Link>
          <span className="px-2">/</span>
          <Link
            href={`/categories/${product.categorySlug}`}
            className="hover:text-highlight"
          >
            {product.categoryNameFa}
          </Link>
        </nav>

        <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <Card elevated className="overflow-hidden border-border/70 p-0">
            <div className="relative aspect-[4/5] bg-muted/35 sm:aspect-square">
              <Image
                src={product.imageUrl}
                alt={product.titleFa}
                fill
                priority
                sizes={IMAGE_SIZES.productHero}
                className="object-cover"
                unoptimized={/\.svg$/i.test(product.imageUrl)}
              />
            </div>
          </Card>

          <div className="space-y-6 text-start">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant={product.inStock ? "success" : "destructive"}>
                  {product.inStock ? "موجود" : "ناموجود"}
                </Badge>
                {product.isNew ? <Badge variant="highlight">جدید</Badge> : null}
                {product.isBestSeller ? (
                  <Badge variant="secondary">پرفروش</Badge>
                ) : null}
              </div>
              <h1 className="ds-display text-3xl">{product.titleFa}</h1>
              <p className="ds-body text-muted-foreground">{product.descriptionFa}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-elegant">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">قیمت محصول</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-highlight">
                    {formatPriceFa(product.priceMinor)}
                  </p>
                </div>
                {hasDiscount ? (
                  <p className="text-sm text-muted-foreground line-through tabular-nums">
                    {formatPriceFa(product.compareAtMinor!)}
                  </p>
                ) : null}
              </div>
              <AddToCartButton
                productId={product.id}
                titleFa={product.titleFa}
                priceMinor={product.priceMinor}
                imageUrl={product.imageUrl}
                inStock={product.inStock}
              />
            </div>

            {product.specs.length ? (
              <section className="space-y-3">
                <h2 className="ds-title text-xl">مشخصات محصول</h2>
                <dl className="grid gap-2">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.labelFa}
                      className="flex justify-between gap-4 rounded-xl bg-muted/35 px-4 py-3 text-sm"
                    >
                      <dt className="text-muted-foreground">{spec.labelFa}</dt>
                      <dd className="font-semibold">{spec.valueFa}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>
        </section>

        {related.length ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4 text-start">
              <h2 className="ds-title">محصولات مرتبط</h2>
              <Link
                href={`/categories/${product.categorySlug}`}
                className="text-sm font-semibold text-highlight hover:underline"
              >
                مشاهده دسته
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  href={`/products/${item.slug}`}
                  productId={item.id}
                  titleFa={item.titleFa}
                  imageUrl={item.imageUrl}
                  priceMinor={item.priceMinor}
                  compareAtMinor={item.compareAtMinor}
                  priceLabel={formatPriceFa(item.priceMinor)}
                  compareAtLabel={
                    item.compareAtMinor ? formatPriceFa(item.compareAtMinor) : null
                  }
                  badge={item.isNew ? "جدید" : item.isBestSeller ? "پرفروش" : null}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
