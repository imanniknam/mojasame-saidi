export const MAX_PRODUCT_IMAGES = 12;

/** Browser-safe helper for Next/Image previews. */
export function shouldUnoptimizeImageUrl(url: string) {
  return url.startsWith("/uploads/") || url.startsWith("blob:");
}
