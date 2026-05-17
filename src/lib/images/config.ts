import { UPLOAD_PRODUCTS_SUBDIR } from "@/lib/constants/site";

/** مقادیر پیشنهادی `sizes` برای گرید محصولات موبایل‌اول */
export const IMAGE_SIZES = {
  productCard:
    "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" as const,
  productHero:
    "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 960px" as const,
  banner: "100vw" as const,
} as const;

export function publicUploadUrl(filename: string): string {
  const safe = filename.replace(/^\/+/, "");
  return `/${UPLOAD_PRODUCTS_SUBDIR}/${safe}`;
}
