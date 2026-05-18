import { prisma } from "@/lib/prisma";
import { zarinpalRequestPayment, zarinpalVerifyPayment } from "@/lib/payments/zarinpal/client";
import { getZarinpalConfig, isZarinpalEnabled } from "@/lib/payments/zarinpal/config";

export async function startZarinpalPaymentForOrder(input: {
  orderId: string;
  orderNumber: string;
  amountMinor: number;
  mobile?: string;
  email?: string;
}) {
  if (!isZarinpalEnabled()) {
    throw new Error("ZARINPAL_NOT_CONFIGURED");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      orderId: input.orderId,
      provider: "ZARINPAL",
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  const description = `پرداخت سفارش ${input.orderNumber} — مجسمه‌سازی سعیدی`;

  const result = await zarinpalRequestPayment({
    amountMinor: input.amountMinor,
    description,
    mobile: input.mobile,
    email: input.email,
    orderId: input.orderId,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      authority: result.authority,
      rawPayload: result.raw as object,
    },
  });

  return {
    paymentId: payment.id,
    authority: result.authority,
    gatewayUrl: result.gatewayUrl,
  };
}

export async function completeZarinpalCallback(input: {
  authority: string;
  status: string;
}) {
  const payment = await prisma.payment.findFirst({
    where: { authority: input.authority, provider: "ZARINPAL" },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          totalMinor: true,
          trackingToken: true,
          status: true,
        },
      },
    },
  });

  if (!payment?.order) {
    return {
      ok: false as const,
      reason: "NOT_FOUND" as const,
      orderNumber: null,
      trackingToken: null,
    };
  }

  const { order } = payment;

  if (input.status !== "OK") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        rawPayload: {
          callbackStatus: input.status,
        },
      },
    });

    return {
      ok: false as const,
      reason: "CANCELLED" as const,
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
    };
  }

  if (payment.status === "CAPTURED") {
    return {
      ok: true as const,
      alreadyPaid: true,
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      refId: payment.externalRef,
    };
  }

  const verify = await zarinpalVerifyPayment({
    authority: input.authority,
    amountMinor: payment.amountMinor,
  });

  if (!verify.success) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        rawPayload: verify.raw as object,
      },
    });

    return {
      ok: false as const,
      reason: "VERIFY_FAILED" as const,
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      message: verify.message,
    };
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        paidAt: now,
        failedAt: null,
        externalRef: String(verify.refId),
        cardPanMasked: verify.cardPanMasked,
        rawPayload: verify.raw as object,
      },
    }),
    prisma.order.updateMany({
      where: { id: order.id, status: "AWAITING_PAYMENT" },
      data: { status: "PAID" },
    }),
  ]);

  return {
    ok: true as const,
    alreadyPaid: false,
    orderNumber: order.orderNumber,
    trackingToken: order.trackingToken,
    refId: String(verify.refId),
  };
}

export function getZarinpalPublicStatus() {
  const config = getZarinpalConfig();
  return {
    enabled: Boolean(config),
    sandbox: config?.sandbox ?? false,
  };
}
