import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";
import { listStoreCategories, listStoreProducts } from "@/lib/storefront/queries";

export const dynamic = "force-dynamic";

const staticRoutes = (): MetadataRoute.Sitemap => {
  const now = new Date();
  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/products"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/categories"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = staticRoutes();

  if (!process.env.DATABASE_URL?.trim()) {
    return base;
  }

  try {
    const [storeCategories, storeProducts] = await Promise.all([
      listStoreCategories(),
      listStoreProducts(),
    ]);
    const now = new Date();

  const categoryRoutes: MetadataRoute.Sitemap = storeCategories.map((category) => ({
    url: absoluteUrl(`/categories/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const productRoutes: MetadataRoute.Sitemap = storeProducts.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: product.isFeatured ? 0.85 : 0.7,
  }));

  return [...base, ...categoryRoutes, ...productRoutes];
  } catch {
    return base;
  }
}
