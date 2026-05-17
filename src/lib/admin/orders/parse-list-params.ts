import { adminOrderListSchema } from "@/lib/validations/orders";

export function parseOrderListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const pick = (key: string) => {
    const value = searchParams[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  return adminOrderListSchema.parse({
    q: pick("q"),
    page: pick("page") ?? 1,
    limit: pick("limit") ?? 20,
    status: pick("status") ?? "all",
    paymentStatus: pick("paymentStatus") ?? "all",
  });
}
