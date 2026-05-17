import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";

const orderStatusValues = Object.values(OrderStatus) as [OrderStatus, ...OrderStatus[]];
const paymentStatusValues = Object.values(PaymentStatus) as [PaymentStatus, ...PaymentStatus[]];

export const adminOrderListSchema = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["all", ...orderStatusValues]).default("all"),
  paymentStatus: z.enum(["all", ...paymentStatusValues]).default("all"),
});

export const orderStatusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const paymentStatusUpdateSchema = z.object({
  paymentId: z.string().min(1),
  status: z.nativeEnum(PaymentStatus),
});

export const orderNotesUpdateSchema = z.object({
  notesAdmin: z.string().trim().max(4000).nullable(),
});

export type AdminOrderListInput = z.infer<typeof adminOrderListSchema>;
