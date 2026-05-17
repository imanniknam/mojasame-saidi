import { adminProductListSchema } from "@/lib/validations/catalog";

export function parseProductListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const pick = (key: string) => {
    const value = searchParams[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  return adminProductListSchema.parse({
    q: pick("q"),
    page: pick("page") ?? 1,
    limit: pick("limit") ?? 20,
    categoryId: pick("categoryId"),
    isFeatured: pick("isFeatured") ?? "all",
    status: pick("status") ?? "all",
  });
}
