import type { Metadata, Viewport } from "next";
// فونت‌ها در globals.css با @font-face از public/fonts بارگذاری می‌شوند.
// next/font/google عمداً استفاده نمی‌شود — بیلد را به شبکه وابسته می‌کرد و در
// نبود دسترسی، بی‌صدا به Arial تنزل می‌داد.
import { Providers } from "@/components/providers";
import { getStoreNavUser } from "@/lib/auth/store-nav-user";
import { JsonLd } from "@/components/seo/json-ld";
import {
  DEFAULT_SEO_DESCRIPTION,
  buildOrganizationJsonLd,
  getSiteUrl,
} from "@/lib/seo/metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "فروشگاه مجسمه‌سازی سعیدی",
    template: "%s | فروشگاه مجسمه‌سازی سعیدی",
  },
  description: DEFAULT_SEO_DESCRIPTION,
  keywords: [
    "فروشگاه مجسمه سازی سعیدی",
    "خرید مجسمه",
    "مجسمه دست ساز",
    "دکور دست ساز",
    "گلدان دکوری",
    "تندیس",
    "جاشمعی",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    locale: "fa_IR",
    siteName: "فروشگاه مجسمه‌سازی سعیدی",
    type: "website",
    title: "فروشگاه مجسمه‌سازی سعیدی",
    description: DEFAULT_SEO_DESCRIPTION,
    url: getSiteUrl(),
    images: [
      {
        url: "/images/og-default.svg",
        width: 1200,
        height: 630,
        alt: "فروشگاه مجسمه‌سازی سعیدی",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "فروشگاه مجسمه‌سازی سعیدی",
    description: DEFAULT_SEO_DESCRIPTION,
    images: ["/images/og-default.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0c0a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSessionUser = await getStoreNavUser();

  return (
    <html lang="fa" dir="rtl" className="dark">
      <head>
        {/* زیرمجموعه‌ی عربی وزیرمتن روی همه‌ی صفحات لازم است، پس زودتر گرفته
            می‌شود تا متن فارسی با فالبک سیستمی پرش نکند. بقیه‌ی فونت‌ها را
            مرورگر بر اساس unicode-range فقط در صورت نیاز می‌گیرد. */}
        <link
          rel="preload"
          href="/fonts/vazirmatn-arabic-100_900.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <JsonLd data={buildOrganizationJsonLd()} />
        <Providers initialSessionUser={initialSessionUser}>{children}</Providers>
      </body>
    </html>
  );
}
