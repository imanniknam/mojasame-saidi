import type { CartDiscount } from "@/lib/cart/types";

const FREE_SHIPPING_THRESHOLD_MINOR = 2_000_000;
const DEFAULT_SHIPPING_MINOR = 85_000;
const COURIER_SHIPPING_MINOR = 145_000;

export type CheckoutShippingMethod = "post" | "courier";

const SHIPPING_FEES_BY_METHOD: Record<CheckoutShippingMethod, number> = {
  post: DEFAULT_SHIPPING_MINOR,
  courier: COURIER_SHIPPING_MINOR,
};

function qualifiesForFreeShipping(afterDiscountMinor: number) {
  return afterDiscountMinor >= FREE_SHIPPING_THRESHOLD_MINOR;
}

export function getShippingMinorForMethod(
  method: CheckoutShippingMethod,
  afterDiscountMinor: number,
): number {
  if (qualifiesForFreeShipping(afterDiscountMinor)) return 0;
  return SHIPPING_FEES_BY_METHOD[method];
}

export function getOrderTotalMinor(
  afterDiscountMinor: number,
  method: CheckoutShippingMethod,
): number {
  return afterDiscountMinor + getShippingMinorForMethod(method, afterDiscountMinor);
}

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
