import type { CartDiscount } from "@/lib/cart/types";

const CODES: Record<string, CartDiscount> = {
  WELCOME10: {
    code: "WELCOME10",
    type: "PERCENT",
    value: 10,
    maxMinor: 200_000,
  },
  SAVE50K: { code: "SAVE50K", type: "FIXED_MINOR", value: 50_000 },
};

function normalizeCode(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

export function resolveDiscountCode(raw: string): CartDiscount | null {
  const key = normalizeCode(raw);
  if (!key) return null;
  const def = CODES[key];
  if (!def) return null;
  return { ...def, code: raw.trim() };
}

export function listPublicPromoHints(): string[] {
  return ["WELCOME10", "SAVE50K"];
}
