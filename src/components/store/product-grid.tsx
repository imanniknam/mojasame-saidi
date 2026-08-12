import { ProductCard, ProductCardSkeleton } from "@/components/store/product-card";
import { formatPriceFa } from "@/lib/format";
import type { StoreProduct } from "@/lib/storefront/types";
import { cn } from "@/lib/utils";

export type ProductGridProps = {
  products: StoreProduct[];
  className?: string;
  /** کارت اول تصویرش زودتر بارگذاری شود — فقط در اولین شبکه‌ی صفحه */
  prioritizeFirst?: boolean;
};

/** شبکه‌ی محصولات — دو ستون در موبایل، چهار ستون در دسکتاپ */
export function ProductGrid({
  products,
  className,
  prioritizeFirst = false,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          href={`/products/${product.slug}`}
          productId={product.id}
          titleFa={product.titleFa}
          imageUrl={product.imageUrl}
          subtitleFa={product.categoryNameFa}
          priceMinor={product.priceMinor}
          compareAtMinor={product.compareAtMinor}
          priceLabel={formatPriceFa(product.priceMinor)}
          compareAtLabel={
            product.compareAtMinor ? formatPriceFa(product.compareAtMinor) : null
          }
          badge={product.isNew ? "جدید" : product.isBestSeller ? "پرفروش" : null}
          hasVariants={product.variants.length > 0}
          priority={prioritizeFirst && index === 0}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
