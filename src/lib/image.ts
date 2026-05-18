export function shouldUnoptimizeImageUrl(url: string) {
  return url.startsWith("/uploads/") || url.startsWith("blob:");
}
