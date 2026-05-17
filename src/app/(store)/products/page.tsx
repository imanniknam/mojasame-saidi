import type { Metadata } from "next";
import { ProductCard } from "@/components/store/product-card";
import { formatPriceFa } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { storeProducts } from "@/lib/storefront/mock-data";

export const metadata: Metadata = buildPageMetadata({
  title: "همه محصولات",
  description:
    "خرید محصولات دست‌ساز و دکوراتیو فروشگاه مجسمه‌سازی سعیدی؛ مجسمه، گلدان، تندیس و جاشمعی.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <main className="ds-section mx-auto max-w-6xl space-y-6 pb-28">
      <header className="space-y-2 text-start">
        <p className="ds-overline">فروشگاه</p>
        <h1 className="ds-display text-3xl">همه محصولات</h1>
        <p className="ds-subtitle max-w-2xl">
          انتخابی از دکورهای دست‌ساز، هنری و گرم برای خانه و محل کار.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {storeProducts.map((product) => (
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
      </div>
    </main>
  );
}
