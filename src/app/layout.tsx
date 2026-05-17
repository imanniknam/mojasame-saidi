import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import {
  DEFAULT_SEO_DESCRIPTION,
  buildOrganizationJsonLd,
  getSiteUrl,
} from "@/lib/seo/metadata";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

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
  themeColor: "#100e0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} dark`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <JsonLd data={buildOrganizationJsonLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
