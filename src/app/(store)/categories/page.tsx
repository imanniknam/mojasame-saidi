import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { CategoryCard } from "@/components/store/category-card";
import { EmptyState } from "@/components/store/empty-state";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCachedStoreCategories } from "@/lib/storefront/cached";
import { safeQuery } from "@/lib/storefront/safe";

export const metadata: Metadata = buildPageMetadata({
  title: "مجموعه‌ها",
  description:
    "مشاهده مجموعه‌های آثار دست‌ساز مجسمه سعیدی؛ مجسمه، تندیس، گلدان، جاشمعی و دکور هنری.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await safeQuery("categoriesPage", getCachedStoreCategories, []);

  return (
    <main className="mb-nav">
      <div className="ds-container pt-6">
        <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مجموعه‌ها" }]} />
      </div>

      <div className="ds-container py-8 lg:py-10">
        <p className="ds-overline">Collections</p>
        <h1 className="ds-title mt-2 text-foreground">مجموعه‌ها</h1>
        <p className="ds-prose mt-3">
          آثار دست‌ساز سعیدی را بر اساس نوع دکور و کاربرد پیدا کنید.
        </p>

        <div className="mt-8">
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  nameFa={category.nameFa}
                  count={category.count}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              titleFa="مجموعه‌ای برای نمایش نیست"
              descriptionFa="در حال حاضر دسته‌بندی فعالی ثبت نشده است."
              ctaHref="/products"
              ctaLabel="مشاهده محصولات"
            />
          )}
        </div>
      </div>
    </main>
  );
}
