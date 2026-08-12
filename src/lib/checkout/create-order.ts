import { Prisma } from "@prisma/client";
import type { CartDiscount } from "@/lib/cart/types";
import { computeCartTotals } from "@/lib/cart/totals";
import type { AuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export type CheckoutLineInput = {
  productId: string;
  variantId?: string;
  quantity: number;
  unitMinor: number;
};

export type CheckoutAddressInput = {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
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

// هزینه‌ی ارسال فعلاً حذف شده (تصمیم موقت) — همراه با src/lib/cart/totals.ts
// و checkout-flow.tsx هم‌زمان به‌روزرسانی می‌شود. این فایل مرجع نهاییِ مبلغی
// است که واقعاً از مشتری گرفته و به زرین‌پال فرستاده می‌شود.
const SHIPPING_FEES = {
  standard: 0,
  express: 0,
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
  const variantIds = input.lines
    .map((l) => l.variantId)
    .filter((id): id is string => !!id);

  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: {
        inventory: true,
        category: { select: { slug: true } },
      },
    }),
    variantIds.length > 0
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds }, isActive: true },
          select: { id: true, productId: true, priceMinor: true, nameFa: true },
        })
      : Promise.resolve([]),
  ]);

  if (products.length !== productIds.length) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  /**
   * موجودی به‌ازای هر **محصول** سنجیده می‌شود، نه هر خط.
   *
   * سبد می‌تواند چند خط از یک محصول داشته باشد (سایزهای مختلف، یا خطی که
   * جداگانه اضافه شده). قبلاً هر خط مستقل با کل موجودی مقایسه می‌شد، پس دو
   * خط ۳تایی از محصولی با موجودی ۴ هر دو قبول می‌شدند و ۶ عدد فروخته می‌شد.
   */
  const quantityByProduct = new Map<string, number>();
  for (const line of input.lines) {
    quantityByProduct.set(
      line.productId,
      (quantityByProduct.get(line.productId) ?? 0) + line.quantity,
    );
  }

  for (const [productId, quantity] of quantityByProduct) {
    const product = productMap.get(productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    const available =
      (product.inventory?.quantityOnHand ?? 0) -
      (product.inventory?.quantityReserved ?? 0);
    if (available < quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }
  }

  const pricedLines = input.lines.map((line) => {
    const product = productMap.get(line.productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    let unitPriceMinor = product.priceMinor;
    let variantNameFaSnap: string | undefined;

    if (line.variantId) {
      const variant = variantMap.get(line.variantId);
      if (!variant || variant.productId !== product.id) {
        throw new Error("VARIANT_NOT_FOUND");
      }
      unitPriceMinor = variant.priceMinor;
      variantNameFaSnap = variant.nameFa;
    }

    if (line.unitMinor !== unitPriceMinor) {
      throw new Error("PRICE_MISMATCH");
    }

    return {
      productId: product.id,
      variantId: line.variantId,
      variantNameFaSnap,
      quantity: line.quantity,
      unitPriceMinor,
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
    postalCode: input.address.postalCode,
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
        for (const [productId, quantity] of quantityByProduct) {
          /**
           * شرط اتمیک باید همان تعریفِ «موجودِ قابل فروش» را داشته باشد که
           * بالاتر بررسی شد: onHand منهای reserved. با `updateMany` نمی‌شود دو
           * ستون را با هم مقایسه کرد، پس اینجا SQL خام است. قبلاً فقط onHand
           * سنجیده می‌شد و اقلام رزروشده هم فروخته می‌شدند.
           */
          const updated = await tx.$executeRaw`
            UPDATE "Inventory"
            SET "quantityOnHand" = "quantityOnHand" - ${quantity}
            WHERE "productId" = ${productId}
              AND "quantityOnHand" - "quantityReserved" >= ${quantity}
          `;
          if (updated === 0) {
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
                variantId: line.variantId ?? null,
                variantNameFaSnap: line.variantNameFaSnap ?? null,
                quantity: line.quantity,
                unitPriceMinor: line.unitPriceMinor,
                titleFaSnap: line.titleFaSnap,
                skuSnap: line.skuSnap,
              })),
            },
            payments: {
              create: {
                provider: input.payment === "online" ? "ZARINPAL" : "MANUAL",
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
            payments: {
              select: { id: true, provider: true },
              take: 1,
              orderBy: { createdAt: "desc" },
            },
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
