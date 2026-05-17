import { requireActiveAdmin } from "@/lib/auth/server";
import { buildOrderListWhere } from "@/lib/admin/orders/queries";
import { orderDetailInclude } from "@/lib/admin/orders/queries";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import { adminOrderListSchema } from "@/lib/validations/orders";

export async function GET(request: Request) {
  try {
    await requireActiveAdmin(request);
    const query = adminOrderListSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = buildOrderListWhere(query);

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: orderDetailInclude,
      }),
      prisma.order.count({ where }),
    ]);

    return jsonNoStore({ ok: true, items, total, page: query.page, limit: query.limit });
  } catch (error) {
    return apiErrorResponse(error, {
      code: "ADMIN_ORDER_LIST_FAILED",
      publicMessage: "دریافت سفارش‌ها با خطا روبه‌رو شد.",
    });
  }
}
