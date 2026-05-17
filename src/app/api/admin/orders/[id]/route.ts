import { Prisma } from "@prisma/client";
import { requireActiveAdmin } from "@/lib/auth/server";
import { orderDetailInclude } from "@/lib/admin/orders/queries";
import {
  updateOrderNotesRecord,
  updateOrderStatusRecord,
  updatePaymentStatusRecord,
} from "@/lib/admin/orders/service";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import {
  orderNotesUpdateSchema,
  orderStatusUpdateSchema,
  paymentStatusUpdateSchema,
} from "@/lib/validations/orders";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireActiveAdmin(request);
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: orderDetailInclude,
    });

    if (!order) {
      return jsonNoStore(
        { ok: false, error: { code: "NOT_FOUND", message: "سفارش پیدا نشد." } },
        { status: 404 },
      );
    }

    return jsonNoStore({ ok: true, order });
  } catch (error) {
    return apiErrorResponse(error, {
      code: "ADMIN_ORDER_GET_FAILED",
      publicMessage: "دریافت سفارش با خطا روبه‌رو شد.",
    });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireActiveAdmin(request);
    const { id } = await context.params;
    const body = await request.json();

    if (body.status !== undefined) {
      const input = orderStatusUpdateSchema.parse({ status: body.status });
      const order = await updateOrderStatusRecord(id, input.status);
      return jsonNoStore({ ok: true, order });
    }

    if (body.notesAdmin !== undefined) {
      const input = orderNotesUpdateSchema.parse({ notesAdmin: body.notesAdmin });
      const order = await updateOrderNotesRecord(id, input.notesAdmin);
      return jsonNoStore({ ok: true, order });
    }

    if (body.paymentId && body.paymentStatus) {
      const input = paymentStatusUpdateSchema.parse({
        paymentId: body.paymentId,
        status: body.paymentStatus,
      });
      const order = await updatePaymentStatusRecord(input.paymentId, input.status);
      return jsonNoStore({ ok: true, order });
    }

    return jsonNoStore(
      { ok: false, error: { code: "BAD_REQUEST", message: "بدنه درخواست معتبر نیست." } },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonNoStore(
        { ok: false, error: { code: "NOT_FOUND", message: "سفارش پیدا نشد." } },
        { status: 404 },
      );
    }

    return apiErrorResponse(error, {
      code: "ADMIN_ORDER_UPDATE_FAILED",
      publicMessage: "به‌روزرسانی سفارش با خطا روبه‌رو شد.",
    });
  }
}
