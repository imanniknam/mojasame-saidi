import { ZodError } from "zod";
import { getActiveSessionUserFromRequest } from "@/lib/auth/server";
import { ensureAuthSchemaReady } from "@/lib/auth/db";
import { createStoreOrder } from "@/lib/checkout/create-order";
import { startZarinpalPaymentForOrder } from "@/lib/payments/zarinpal/service";
import { jsonNoStore, apiErrorResponse } from "@/lib/server/api-response";
import { storeCheckoutSchema } from "@/lib/validations/store-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, { code: string; message: string; status: number }> = {
  EMPTY_CART: {
    code: "EMPTY_CART",
    message: "سبد خرید خالی است.",
    status: 422,
  },
  PRODUCT_NOT_FOUND: {
    code: "PRODUCT_NOT_FOUND",
    message: "یکی از محصولات سبد دیگر موجود نیست.",
    status: 409,
  },
  INSUFFICIENT_STOCK: {
    code: "INSUFFICIENT_STOCK",
    message: "موجودی یکی از محصولات کافی نیست.",
    status: 409,
  },
  PRICE_MISMATCH: {
    code: "PRICE_MISMATCH",
    message: "قیمت محصول تغییر کرده است. سبد را به‌روز کنید.",
    status: 409,
  },
  ZARINPAL_NOT_CONFIGURED: {
    code: "ZARINPAL_NOT_CONFIGURED",
    message:
      "درگاه زرین‌پال تنظیم نشده است. ZARINPAL_MERCHANT_ID را در فایل .env وارد کنید.",
    status: 503,
  },
};

export async function POST(request: Request) {
  const schemaError = await ensureAuthSchemaReady();
  if (schemaError) {
    return jsonNoStore(
      { ok: false, error: { code: schemaError.code, message: schemaError.message } },
      { status: schemaError.status },
    );
  }

  try {
    const body = storeCheckoutSchema.parse(await request.json());
    const sessionUser = await getActiveSessionUserFromRequest(request);
    const { order, totals } = await createStoreOrder({
      ...body,
      discount: body.discount ?? null,
      sessionUser,
    });

    const basePayload = {
      ok: true as const,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalMinor: order.totalMinor,
        trackingToken: order.trackingToken,
      },
      totals,
    };

    if (body.payment === "online") {
      const gateway = await startZarinpalPaymentForOrder({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amountMinor: order.totalMinor,
        mobile: body.address.phone,
        email: sessionUser?.email,
      });

      return jsonNoStore({
        ...basePayload,
        payment: {
          provider: "ZARINPAL" as const,
          gatewayUrl: gateway.gatewayUrl,
        },
      });
    }

    return jsonNoStore({
      ...basePayload,
      payment: {
        provider: "MANUAL" as const,
        gatewayUrl: null,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.issues[0]?.message ?? "اطلاعات سفارش معتبر نیست.",
          },
        },
        { status: 422 },
      );
    }

    if (error instanceof Error) {
      const mapped = ERROR_MESSAGES[error.message];
      if (mapped) {
        return jsonNoStore(
          { ok: false, error: { code: mapped.code, message: mapped.message } },
          { status: mapped.status },
        );
      }
    }

    return apiErrorResponse(error, {
      code: "CHECKOUT_FAILED",
      publicMessage: "ثبت سفارش با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.",
    });
  }
}
