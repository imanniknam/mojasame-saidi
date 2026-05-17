import type { Metadata } from "next";
import { CategoryCard } from "@/components/store/category-card";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { listStoreCategories } from "@/lib/storefront/queries";

export const metadata: Metadata = buildPageMetadata({
  title: "دسته‌بندی محصولات",
  description:
    "مشاهده دسته‌بندی محصولات دست‌ساز فروشگاه مجسمه‌سازی سعیدی؛ گلدان، تندیس، جاشمعی و دکور هنری.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const storeCategories = await listStoreCategories();

  return (
    <main className="ds-section mx-auto max-w-6xl space-y-6 pb-28">
      <header className="space-y-2 text-start">
        <p className="ds-overline">دسته‌بندی‌ها</p>
        <h1 className="ds-display text-3xl">دسته‌بندی محصولات</h1>
        <p className="ds-subtitle max-w-2xl">
          محصولات دست‌ساز سعیدی را بر اساس نوع دکور و کاربرد پیدا کنید.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    </main>
  );
}
