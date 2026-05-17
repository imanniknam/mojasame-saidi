"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireActiveAdminSession } from "@/lib/auth/server";
import { zodFieldErrors } from "@/lib/admin/products/errors";
import {
  orderNotesUpdateSchema,
  orderStatusUpdateSchema,
  paymentStatusUpdateSchema,
} from "@/lib/validations/orders";
import { Prisma } from "@prisma/client";
import {
  updateOrderNotesRecord,
  updateOrderStatusRecord,
  updatePaymentStatusRecord,
} from "./service";
import type { OrderActionState } from "./types";
import { initialOrderActionState } from "./types";

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderStatusAction(
  orderId: string,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  try {
    await requireActiveAdminSession();
    const input = orderStatusUpdateSchema.parse({
      status: formData.get("status"),
    });
    await updateOrderStatusRecord(orderId, input.status);
    revalidateOrderPaths(orderId);
    return { ok: true, message: "وضعیت سفارش به‌روزرسانی شد." };
  } catch (error) {
    return actionError(error, "به‌روزرسانی وضعیت سفارش ناموفق بود.");
  }
}

export async function updatePaymentStatusAction(
  orderId: string,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  try {
    await requireActiveAdminSession();
    const input = paymentStatusUpdateSchema.parse({
      paymentId: formData.get("paymentId"),
      status: formData.get("status"),
    });
    await updatePaymentStatusRecord(input.paymentId, input.status);
    revalidateOrderPaths(orderId);
    return { ok: true, message: "وضعیت پرداخت به‌روزرسانی شد." };
  } catch (error) {
    return actionError(error, "به‌روزرسانی وضعیت پرداخت ناموفق بود.");
  }
}

export async function updateOrderNotesAction(
  orderId: string,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  try {
    await requireActiveAdminSession();
    const raw = String(formData.get("notesAdmin") ?? "").trim();
    const input = orderNotesUpdateSchema.parse({
      notesAdmin: raw === "" ? null : raw,
    });
    await updateOrderNotesRecord(orderId, input.notesAdmin);
    revalidateOrderPaths(orderId);
    return { ok: true, message: "یادداشت مدیر ذخیره شد." };
  } catch (error) {
    return actionError(error, "ذخیره یادداشت ناموفق بود.");
  }
}

function actionError(error: unknown, fallback: string): OrderActionState {
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return { ok: false, message: "دسترسی شما به این بخش مجاز نیست." };
  }
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: "اطلاعات معتبر نیست.",
      fieldErrors: zodFieldErrors(error),
    };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return { ok: false, message: "سفارش یا پرداخت پیدا نشد." };
  }
  return { ok: false, message: fallback };
}

export { initialOrderActionState };
