import type { CartDiscount } from "@/lib/cart/types";

const FREE_SHIPPING_THRESHOLD_MINOR = 2_000_000;
const DEFAULT_SHIPPING_MINOR = 85_000;

export type CartTotals = {
  subtotalMinor: number;
  discountMinor: number;
  afterDiscountMinor: number;
  shippingMinor: number;
  totalMinor: number;
  qualifiesFreeShipping: boolean;
  amountToFreeShippingMinor: number;
};

function discountAmountMinor(
  subtotal: number,
  discount: CartDiscount | null,
): number {
  if (!discount || subtotal <= 0) return 0;
  if (discount.type === "PERCENT") {
    let raw = Math.floor((subtotal * discount.value) / 100);
    if (discount.maxMinor != null) {
      raw = Math.min(raw, discount.maxMinor);
    }
    return Math.min(raw, subtotal);
  }
  return Math.min(discount.value, subtotal);
}

export function computeCartTotals(
  lines: { unitMinor: number; quantity: number }[],
  discount: CartDiscount | null,
  shippingMinorOverride?: number,
): CartTotals {
  const subtotalMinor = lines.reduce(
    (sum, l) => sum + l.unitMinor * l.quantity,
    0,
  );
  const discountMinor = discountAmountMinor(subtotalMinor, discount);
  const afterDiscountMinor = Math.max(0, subtotalMinor - discountMinor);

  const qualifiesFreeShipping =
    afterDiscountMinor >= FREE_SHIPPING_THRESHOLD_MINOR;
  const shippingMinor =
    typeof shippingMinorOverride === "number"
      ? shippingMinorOverride
      : qualifiesFreeShipping
        ? 0
        : DEFAULT_SHIPPING_MINOR;

  const totalMinor = afterDiscountMinor + shippingMinor;
  const amountToFreeShippingMinor = qualifiesFreeShipping
    ? 0
    : Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR - afterDiscountMinor);

  return {
    subtotalMinor,
    discountMinor,
    afterDiscountMinor,
    shippingMinor,
    totalMinor,
    qualifiesFreeShipping,
    amountToFreeShippingMinor,
  };
}

export { FREE_SHIPPING_THRESHOLD_MINOR, DEFAULT_SHIPPING_MINOR };
