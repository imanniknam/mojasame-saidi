import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderDetailInclude } from "./queries";

export async function updateOrderStatusRecord(orderId: string, status: OrderStatus) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: orderDetailInclude,
  });
}

export async function updateOrderNotesRecord(orderId: string, notesAdmin: string | null) {
  return prisma.order.update({
    where: { id: orderId },
    data: { notesAdmin },
    include: orderDetailInclude,
  });
}

export async function updatePaymentStatusRecord(paymentId: string, status: PaymentStatus) {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status,
        ...(status === "CAPTURED" ? { paidAt: now, failedAt: null } : {}),
        ...(status === "FAILED" ? { failedAt: now } : {}),
      },
    });

    if (status === "CAPTURED") {
      await tx.order.updateMany({
        where: { id: payment.orderId, status: "AWAITING_PAYMENT" },
        data: { status: "PAID" },
      });
    }

    return tx.order.findUniqueOrThrow({
      where: { id: payment.orderId },
      include: orderDetailInclude,
    });
  });
}
