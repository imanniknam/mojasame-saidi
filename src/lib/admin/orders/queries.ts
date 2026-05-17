import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminOrderListInput } from "@/lib/validations/orders";

export const orderDetailInclude = {
  customer: {
    select: {
      id: true,
      displayFa: true,
      firstName: true,
      lastName: true,
      user: { select: { id: true, email: true, phone: true } },
    },
  },
  items: {
    orderBy: [{ id: "asc" as const }],
    include: {
      product: { select: { id: true, slug: true, titleFa: true } },
    },
  },
  payments: { orderBy: [{ createdAt: "desc" as const }] },
} satisfies Prisma.OrderInclude;

export function buildOrderListWhere(input: AdminOrderListInput): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (input.status !== "all") {
    where.status = input.status;
  }

  if (input.paymentStatus !== "all") {
    where.payments = { some: { status: input.paymentStatus } };
  }

  if (input.q) {
    where.OR = [
      { orderNumber: { contains: input.q, mode: "insensitive" } },
      { guestEmail: { contains: input.q, mode: "insensitive" } },
      { guestPhone: { contains: input.q, mode: "insensitive" } },
      { guestNameFa: { contains: input.q, mode: "insensitive" } },
      { customer: { user: { email: { contains: input.q, mode: "insensitive" } } } },
      { customer: { user: { phone: { contains: input.q, mode: "insensitive" } } } },
      { customer: { displayFa: { contains: input.q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function searchAdminOrders(input: AdminOrderListInput) {
  const where = buildOrderListWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: input.limit,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalMinor: true,
        createdAt: true,
        guestNameFa: true,
        guestEmail: true,
        guestPhone: true,
        customer: {
          select: {
            id: true,
            displayFa: true,
            firstName: true,
            lastName: true,
            user: { select: { email: true, phone: true } },
          },
        },
        payments: {
          select: { id: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    total,
    page: input.page,
    limit: input.limit,
    totalPages: Math.max(1, Math.ceil(total / input.limit)),
  };
}

export async function getOrderForAdminDetail(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: orderDetailInclude,
  });
}
