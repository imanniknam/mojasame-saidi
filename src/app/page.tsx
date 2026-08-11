import type { ReactNode } from "react";
import { StoreShell } from "@/components/layout/store-shell";
import { CategoryCard } from "@/components/store/category-card";
import { ProductGrid } from "@/components/store/product-grid";
import { Hero } from "@/components/home/hero";
import { SectionHeader } from "@/components/home/section-header";
import { BrandStory } from "@/components/home/brand-story";
import {
  DEFAULT_VALUE_PROPS,
  ValueProps,
  type ValueProp,
} from "@/components/home/value-props";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { safeQuery } from "@/lib/storefront/safe";
import {
  selectBestSellers,
  selectDiscounted,
  selectFeatured,
  selectNewArrivals,
} from "@/lib/storefront/queries";
import {
  getCachedCategoriesWithCounts,
  getCachedHomepageProducts,
  getCachedHomepageSections,
  getCachedStorefrontSettings,
} from "@/lib/storefront/cached";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "مجسمه سعیدی | مجسمه و دکور دست‌ساز",
  description:
    "خرید مجسمه، تندیس، گلدان، جاشمعی و دکور دست‌ساز از مجسمه سعیدی؛ مجموعه‌ای از فاخرترین آثار دکوراتیو برای خاص‌ترین فضاها.",
  path: "/",
});

/**
 * متن‌های تحریریه‌ی صفحه اصلی.
 * فعلاً اینجا ثابت‌اند؛ وقتی ادمین بخواهد ویرایش‌شان کند به StoreSettings منتقل می‌شوند.
 */
const HERO_COPY = {
  titleFa: "هنر، در جزئیات ماندگار است",
  subtitleFa:
    "مجموعه‌ای از فاخرترین مجسمه‌های دکوراتیو برای خاص‌ترین فضاها.",
  ctaLabel: "مشاهده مجموعه",
} as const;

const STORY_COPY = {
  titleFa: "داستان مجسمه سعیدی",
  bodyFa:
    "ما در مجسمه سعیدی، با عشق به هنر و جزئیات، آثاری خلق می‌کنیم که فراتر از دکوراسیون به فضاها شخصیت و اصالت می‌بخشند.\n\nهر مجسمه، نتیجه‌ی دقت در طراحی، کیفیت در ساخت و احترام به هنر کلاسیک و مدرن است.",
  ctaLabel: "درباره ما",
} as const;

/**
 * ترتیب پیش‌فرض بخش‌ها — فقط وقتی استفاده می‌شود که خواندن HomepageSection
 * شکست بخورد. در حالت عادی ترتیب و عنوان‌ها از پنل ادمین می‌آید.
 */
const DEFAULT_SECTIONS = [
  { key: "HERO", titleFa: null, subtitleFa: null, config: null },
  { key: "CATEGORIES", titleFa: "مجموعه‌ها", subtitleFa: null, config: null },
  { key: "FEATURED", titleFa: "منتخب فروشگاه", subtitleFa: null, config: null },
  { key: "TRUST", titleFa: null, subtitleFa: null, config: null },
];

/** trustBadges در دیتابیس JSON آزاد است — با احتیاط بخوانش */
function parseValueProps(raw: unknown): ValueProp[] {
  if (!Array.isArray(raw)) return DEFAULT_VALUE_PROPS;

  const parsed = raw.flatMap((item): ValueProp[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const titleFa = typeof record.titleFa === "string" ? record.titleFa : null;
    if (!titleFa) return [];
    return [
      {
        titleFa,
        icon: typeof record.icon === "string" ? record.icon : "award",
        descriptionFa:
          typeof record.descriptionFa === "string" ? record.descriptionFa : null,
      },
    ];
  });

  return parsed.length > 0 ? parsed : DEFAULT_VALUE_PROPS;
}

export default async function RootPage() {
  /**
   * هر بخش صفحه مستقل واکشی می‌شود. اگر یکی از کوئری‌ها شکست بخورد (قطعی
   * لحظه‌ای دیتابیس)، فقط همان بخش حذف می‌شود و بقیه‌ی صفحه سالم می‌ماند —
   * به‌جای اینکه کل صفحه ۵۰۰ بدهد. خطا در safeQuery لاگ می‌شود.
   */
  const [settings, sections, categories, products] = await Promise.all([
    safeQuery("settings", getCachedStorefrontSettings, null),
    safeQuery("homepageSections", getCachedHomepageSections, DEFAULT_SECTIONS),
    safeQuery("categories", getCachedCategoriesWithCounts, []),
    safeQuery("products", getCachedHomepageProducts, []),
  ]);

  // بخش‌ها از همان یک نتیجه ساخته می‌شوند — بدون کوئری اضافه.
  const featured = selectFeatured(products);
  const bestSellers = selectBestSellers(products);
  const newArrivals = selectNewArrivals(products);
  const discounted = selectDiscounted(products);

  const heroFeature = featured[0] ?? null;
  const valueProps = parseValueProps(settings?.trustBadges);

  /** یک بخش محصولی — اگر محصولی نداشته باشد اصلاً رندر نمی‌شود */
  function productSection(
    key: string,
    titleFa: string,
    products: typeof featured,
    href: string,
    overline?: string,
  ): ReactNode {
    if (products.length === 0) return null;
    return (
      <section key={key} className="ds-container ds-section">
        <SectionHeader titleFa={titleFa} overline={overline} linkHref={href} />
        <ProductGrid products={products} />
      </section>
    );
  }

  const rendered = sections
    .map((section): ReactNode => {
      switch (section.key) {
        case "HERO":
          return (
            <Hero
              key="HERO"
              titleFa={HERO_COPY.titleFa}
              subtitleFa={HERO_COPY.subtitleFa}
              ctaHref="/products"
              ctaLabel={HERO_COPY.ctaLabel}
              backgroundImageUrl="/images/brand/home-hero.webp"
              backgroundImageAlt="نیم‌تنه کلاسیک در گالری مجسمه سعیدی"
              secondaryHref="/categories"
              secondaryLabel="مجموعه‌ها"
              feature={
                heroFeature
                  ? {
                      titleFa: heroFeature.titleFa,
                      imageUrl: heroFeature.imageUrl,
                      href: `/products/${heroFeature.slug}`,
                      categoryFa: heroFeature.categoryNameFa,
                    }
                  : null
              }
            />
          );

        case "TRUST":
          return <ValueProps key="TRUST" items={valueProps} />;

        case "CATEGORIES":
          if (categories.length === 0) return null;
          return (
            <section key="CATEGORIES" className="ds-container ds-section">
              <SectionHeader
                titleFa={section.titleFa ?? "مجموعه‌ها"}
                overline="Collections"
                linkHref="/categories"
              />
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {categories.slice(0, 8).map((category) => (
                  <CategoryCard
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    nameFa={category.nameFa}
                    count={category.count}
                  />
                ))}
              </div>
            </section>
          );

        case "FEATURED":
          return productSection(
            "FEATURED",
            section.titleFa ?? "منتخب فروشگاه",
            featured,
            "/products",
            "Featured",
          );

        case "BEST_SELLERS":
          return productSection(
            "BEST_SELLERS",
            section.titleFa ?? "پرفروش‌ترین محصولات",
            bestSellers,
            "/products",
            "Best Sellers",
          );

        case "NEW_ARRIVALS":
          return productSection(
            "NEW_ARRIVALS",
            section.titleFa ?? "تازه‌ها",
            newArrivals,
            "/products",
            "New Arrivals",
          );

        case "DISCOUNTS":
          return productSection(
            "DISCOUNTS",
            section.titleFa ?? "تخفیف‌ها",
            discounted,
            "/products",
            "Offers",
          );

        default:
          return null;
      }
    })
    .filter(Boolean);

  return (
    <StoreShell>
      <main>
        {rendered}

        <BrandStory
          titleFa={STORY_COPY.titleFa}
          bodyFa={STORY_COPY.bodyFa}
          ctaHref="/about"
          ctaLabel={STORY_COPY.ctaLabel}
          imageUrl="/images/brand/atelier-story.webp"
          imageAlt="هنرمند در حال پرداخت جزئیات یک مجسمه کلاسیک"
        />
      </main>
    </StoreShell>
  );
}
