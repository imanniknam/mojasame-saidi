import { Prisma } from "@prisma/client";
import type { CartDiscount } from "@/lib/cart/types";
import { computeCartTotals } from "@/lib/cart/totals";
import type { AuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export type CheckoutLineInput = {
  productId: string;
  quantity: number;
  unitMinor: number;
};

export type CheckoutAddressInput = {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode?: string;
  addressLine: string;
  notes?: string;
};

export type CreateOrderInput = {
  lines: CheckoutLineInput[];
  discount: CartDiscount | null;
  shipping: "standard" | "express" | "pickup";
  payment: "online" | "cardToCard";
  address: CheckoutAddressInput;
  sessionUser: AuthenticatedUser | null;
};

const SHIPPING_FEES = {
  standard: 85_000,
  express: 145_000,
  pickup: 0,
} as const;

function generateOrderNumber() {
  const now = new Date();
  const ymd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `MS-${ymd}-${suffix}`;
}

async function resolveServerDiscount(
  code: string | null | undefined,
  subtotalMinor: number,
): Promise<CartDiscount | null> {
  if (!code?.trim()) return null;

  const row = await prisma.discount.findFirst({
    where: {
      code: code.trim().toUpperCase(),
      isActive: true,
    },
  });

  if (!row) return null;

  const now = new Date();
  if (row.startsAt && row.startsAt > now) return null;
  if (row.endsAt && row.endsAt < now) return null;
  if (row.minOrderMinor != null && subtotalMinor < row.minOrderMinor) return null;
  if (row.usageLimit != null && row.usageCount >= row.usageLimit) return null;

  if (row.type === "PERCENT") {
    return {
      code: row.code ?? code,
      type: "PERCENT",
      value: row.value,
      maxMinor: row.maxDiscountMinor ?? undefined,
    };
  }

  return {
    code: row.code ?? code,
    type: "FIXED_MINOR",
    value: row.value,
  };
}

export async function createStoreOrder(input: CreateOrderInput) {
  if (!input.lines.length) {
    throw new Error("EMPTY_CART");
  }

  const productIds = [...new Set(input.lines.map((line) => line.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: {
      inventory: true,
      category: { select: { slug: true } },
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const pricedLines = input.lines.map((line) => {
    const product = productMap.get(line.productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    const available =
      (product.inventory?.quantityOnHand ?? 0) -
      (product.inventory?.quantityReserved ?? 0);
    if (available < line.quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    if (line.unitMinor !== product.priceMinor) {
      throw new Error("PRICE_MISMATCH");
    }

    return {
      productId: product.id,
      quantity: line.quantity,
      unitPriceMinor: product.priceMinor,
      titleFaSnap: product.titleFa,
      skuSnap: product.sku,
    };
  });

  const subtotalMinor = pricedLines.reduce(
    (sum, line) => sum + line.unitPriceMinor * line.quantity,
    0,
  );

  const discount =
    input.discount?.code != null
      ? await resolveServerDiscount(input.discount.code, subtotalMinor)
      : null;

  const shippingMinor = SHIPPING_FEES[input.shipping];
  const totals = computeCartTotals(
    pricedLines.map((line) => ({
      unitMinor: line.unitPriceMinor,
      quantity: line.quantity,
    })),
    discount,
    shippingMinor,
  );

  const shippingSnapshot = {
    recipientFa: input.address.fullName,
    phone: input.address.phone,
    provinceFa: input.address.province,
    cityFa: input.address.city,
    postalCode: input.address.postalCode ?? null,
    line1: input.address.addressLine,
    notes: input.address.notes ?? null,
    method: input.shipping,
    payment: input.payment,
  };

  const customerId =
    input.sessionUser?.role === "CUSTOMER" ? input.sessionUser.customerId : undefined;

  let orderNumber = generateOrderNumber();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const order = await prisma.$transaction(async (tx) => {
        for (const line of pricedLines) {
          const updated = await tx.inventory.updateMany({
            where: {
              productId: line.productId,
              quantityOnHand: { gte: line.quantity },
            },
            data: { quantityOnHand: { decrement: line.quantity } },
          });
          if (updated.count === 0) {
            throw new Error("INSUFFICIENT_STOCK");
          }
        }

        const created = await tx.order.create({
          data: {
            orderNumber,
            status: "AWAITING_PAYMENT",
            customerId,
            guestNameFa: customerId ? null : input.address.fullName,
            guestPhone: customerId ? null : input.address.phone,
            guestEmail: input.sessionUser?.email ?? null,
            subtotalMinor: totals.subtotalMinor,
            discountMinor: totals.discountMinor,
            shippingMinor: totals.shippingMinor,
            taxMinor: 0,
            totalMinor: totals.totalMinor,
            notesCustomer: input.address.notes ?? null,
            shippingSnapshot,
            billingSnapshot: shippingSnapshot,
            items: {
              create: pricedLines.map((line) => ({
                productId: line.productId,
                quantity: line.quantity,
                unitPriceMinor: line.unitPriceMinor,
                titleFaSnap: line.titleFaSnap,
                skuSnap: line.skuSnap,
              })),
            },
            payments: {
              create: {
                provider: "MANUAL",
                status: "PENDING",
                amountMinor: totals.totalMinor,
              },
            },
          },
          select: {
            id: true,
            orderNumber: true,
            totalMinor: true,
            trackingToken: true,
          },
        });

        if (discount?.code) {
          await tx.discount.updateMany({
            where: { code: discount.code },
            data: { usageCount: { increment: 1 } },
          });
        }

        return created;
      });

      return { order, totals };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        orderNumber = generateOrderNumber();
        continue;
      }
      throw error;
    }
  }

  throw new Error("ORDER_NUMBER_CONFLICT");
}
