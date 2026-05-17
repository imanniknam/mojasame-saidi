import type { Metadata } from "next";
import { FavoritesPageContent } from "@/components/store/favorites/favorites-page-content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "علاقه‌مندی‌ها",
  description: "لیست محصولات و آثار دکوراتیو ذخیره‌شده در فروشگاه مجسمه‌سازی سعیدی.",
  path: "/favorites",
  noIndex: true,
});

export default function FavoritesPage() {
  return <FavoritesPageContent />;
}
