import Link from "next/link";
import Image from "next/image";
import { StoreShell } from "@/components/layout/store-shell";
import { CategoryCard } from "@/components/store/category-card";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { formatPriceFa } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  listFeaturedProducts,
  listStoreCategories,
  listStoreProducts,
} from "@/lib/storefront/queries";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "فروشگاه مجسمه‌سازی سعیدی | مجسمه و دکور دست‌ساز",
  description:
    "خرید گلدان، تندیس، جاشمعی و دکور دست‌ساز از فروشگاه مجسمه‌سازی سعیدی؛ تجربه‌ای گرم، هنری و لوکس برای خانه.",
  path: "/",
});

export default async function RootPage() {
  const [storeCategories, storeProducts, featuredProducts] = await Promise.all([
    listStoreCategories(),
    listStoreProducts(),
    listFeaturedProducts(8),
  ]);
  const heroProduct = featuredProducts[0] ?? storeProducts[0];

  if (!heroProduct) {
    return (
      <StoreShell>
        <main className="ds-section mx-auto max-w-6xl pb-28 text-center">
          <h1 className="ds-title">فروشگاه مجسمه‌سازی سعیدی</h1>
          <p className="ds-subtitle mt-2">محصولی در پایگاه‌داده ثبت نشده است.</p>
        </main>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <main className="ds-section mb-nav mx-auto max-w-6xl space-y-12 pb-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-highlight/15 bg-[linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--background))_52%,hsl(var(--accent))_100%)] p-4 text-start shadow-float sm:p-6 lg:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,hsl(var(--highlight)/0.18),transparent_18rem)]"
            aria-hidden
          />
          <div className="relative grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
            <div className="relative min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/60 shadow-card">
              <Image
                src={heroProduct.imageUrl}
                alt={heroProduct.titleFa}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover opacity-95"
                unoptimized={/\.svg$/i.test(heroProduct.imageUrl)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
              <div className="absolute bottom-4 right-4 rounded-2xl border border-highlight/25 bg-background/75 px-4 py-3 shadow-elegant backdrop-blur-md">
                <p className="text-xs text-muted-foreground">اثر منتخب امروز</p>
                <p className="mt-1 text-sm font-bold text-foreground">{heroProduct.titleFa}</p>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-[1.5rem] border border-border/60 bg-card/45 p-5 shadow-elegant backdrop-blur-sm sm:p-7">
              <div className="mb-6 flex items-center gap-2">
                <span className="h-px w-10 bg-highlight/70" />
                <p className="ds-overline text-highlight">MojasameSaidi.ir</p>
              </div>
              <h1 className="ds-display max-w-xl text-balance text-[2.35rem] text-foreground sm:text-5xl">
                مجسمه‌های دست‌ساز برای خانه‌های خاص
              </h1>
              <p className="ds-body mt-5 max-w-2xl text-pretty text-muted-foreground">
                مجموعه‌ای تاریک، لوکس و گالری‌محور برای خرید گلدان، تندیس،
                جاشمعی و دکور هنری؛ با تمرکز روی تصویر محصول و حس دست‌ساز.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button variant="luxury" size="touch" asChild>
                  <Link href="/products">مشاهده کالکشن</Link>
                </Button>
                <Button variant="outline" size="touch" asChild>
                  <Link href="/categories">کاوش دسته‌ها</Link>
                </Button>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-2 text-center">
                {["دست‌ساز", "ارسال امن", "چیدمان لوکس"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/60 bg-background/45 px-2 py-3 text-xs font-semibold text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4 text-start">
            <div>
              <p className="ds-overline text-highlight">Category</p>
              <h2 className="ds-title">دسته‌بندی‌ها</h2>
            </div>
            <Link href="/categories" className="text-sm font-semibold text-highlight hover:underline">
              همه دسته‌ها
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {storeCategories.map((category) => (
              <CategoryCard
                key={category.slug}
                href={`/categories/${category.slug}`}
                nameFa={category.nameFa}
                subtitleFa={category.descriptionFa}
                imageUrl="/images/placeholder-product.svg"
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4 text-start">
            <div>
              <p className="ds-overline text-highlight">Featured Sculpture</p>
              <h2 className="ds-title">محصولات منتخب</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-highlight hover:underline">
              همه محصولات
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {(featuredProducts.length ? featuredProducts : storeProducts).map((product) => (
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
        </section>
      </main>
    </StoreShell>
  );
}
