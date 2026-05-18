import { ensureAuthSchemaReady } from "@/lib/auth/db";
import { prisma } from "@/lib/prisma";
import { startZarinpalPaymentForOrder } from "@/lib/payments/zarinpal/service";
import { jsonNoStore, apiErrorResponse } from "@/lib/server/api-response";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  orderNumber: z.string().min(4),
});

/** Resume Zarinpal payment for an unpaid order (e.g. after cancelled gateway). */
export async function POST(request: Request) {
  const schemaError = await ensureAuthSchemaReady();
  if (schemaError) {
    return jsonNoStore(
      { ok: false, error: { code: schemaError.code, message: schemaError.message } },
      { status: schemaError.status },
    );
  }

  try {
    const body = bodySchema.parse(await request.json());

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: body.orderNumber,
        status: "AWAITING_PAYMENT",
      },
      include: {
        payments: {
          where: { provider: "ZARINPAL", status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order?.payments[0]) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "ORDER_NOT_PAYABLE",
            message: "سفارشی برای پرداخت مجدد پیدا نشد یا قبلاً پرداخت شده است.",
          },
        },
        { status: 404 },
      );
    }

    const snapshot = order.shippingSnapshot as { phone?: string } | null;

    const gateway = await startZarinpalPaymentForOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountMinor: order.totalMinor,
      mobile: snapshot?.phone,
      email: order.guestEmail ?? undefined,
    });

    return jsonNoStore({
      ok: true,
      gatewayUrl: gateway.gatewayUrl,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonNoStore(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "شماره سفارش معتبر نیست." } },
        { status: 422 },
      );
    }

    if (error instanceof Error && error.message === "ZARINPAL_NOT_CONFIGURED") {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "ZARINPAL_NOT_CONFIGURED",
            message: "درگاه زرین‌پال در سرور تنظیم نشده است.",
          },
        },
        { status: 503 },
      );
    }

    return apiErrorResponse(error, {
      code: "ZARINPAL_START_FAILED",
      publicMessage: "شروع پرداخت با خطا روبه‌رو شد.",
    });
  }
}
