import type { Metadata } from "next";
import { SITE_DOMAIN, SITE_NAME_FA } from "@/lib/constants/site";
import type { StoreProduct } from "@/lib/storefront/mock-data";

type BuildMetadataInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
};

export const DEFAULT_SEO_DESCRIPTION =
  "خرید مجسمه، گلدان، تندیس و دکور دست‌ساز از فروشگاه مجسمه‌سازی سعیدی با طراحی هنری، کیفیت بالا و ارسال مطمئن.";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://mojasamesaidi.ir";
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image = "/images/og-default.svg",
  type = "website",
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const resolvedDescription = description ?? DEFAULT_SEO_DESCRIPTION;
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description: resolvedDescription,
    alternates: { canonical: url },
    keywords: [
      "مجسمه سازی سعیدی",
      "خرید مجسمه",
      "دکور دست ساز",
      "تندیس",
      "گلدان دکوری",
      "جاشمعی",
      "فروشگاه دکوراتیو",
    ],
    openGraph: {
      title,
      description: resolvedDescription,
      url,
      siteName: SITE_NAME_FA,
      locale: "fa_IR",
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
        }
      : undefined,
  };
}

export function buildProductMetadata(product: StoreProduct): Metadata {
  const title = `${product.titleFa} | ${product.categoryNameFa}`;
  const description = product.descriptionFa;

  return buildPageMetadata({
    title,
    description,
    path: `/products/${product.slug}`,
    image: product.imageUrl,
    type: "website",
  });
}

export function buildProductJsonLd(product: StoreProduct) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const images = product.images.map((image) => absoluteUrl(image));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.titleFa,
    description: product.descriptionFa,
    image: images,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: SITE_NAME_FA,
    },
    category: product.categoryNameFa,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "IRR",
      price: product.priceMinor * 10,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME_FA,
        url: absoluteUrl("/"),
      },
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME_FA,
    alternateName: SITE_DOMAIN,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/og-default.svg"),
  };
}
