import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { resolveDiscountCode } from "@/lib/cart/discount-codes";
import type { CartDiscount } from "@/lib/cart/types";

export type { CartDiscount } from "@/lib/cart/types";

export type CartLineId = string;

export type CartLine = {
  id: CartLineId;
  productId: string;
  variantId?: string;
  variantNameFa?: string;
  titleFa: string;
  unitMinor: number;
  quantity: number;
  imageUrl?: string;
};

type CartState = {
  lines: CartLine[];
  discount: CartDiscount | null;
  addLine: (line: Omit<CartLine, "id"> & { id?: CartLineId }) => void;
  removeLine: (id: CartLineId) => void;
  /** مقدار ۰ = حذف خط از سبد */
  setQuantity: (id: CartLineId, quantity: number) => void;
  clear: () => void;
  applyDiscountCode: (
    raw: string,
  ) => { ok: true } | { ok: false; message: string };
  clearDiscount: () => void;
};

function createLineId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line_${Math.random().toString(36).slice(2)}`;
}

/**
 * سبد مهمان — persist در localStorage؛ تخفیف کددار اختیاری.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      discount: null,
      addLine: (line) => {
        const id = line.id ?? createLineId();
        set({ lines: [...get().lines, { ...line, id }] });
      },
      removeLine: (id) =>
        set({ lines: get().lines.filter((l) => l.id !== id) }),
      setQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((l) => l.id !== id) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.id === id ? { ...l, quantity } : l,
          ),
        });
      },
      clear: () => set({ lines: [], discount: null }),
      applyDiscountCode: (raw) => {
        const resolved = resolveDiscountCode(raw);
        if (!resolved) {
          return { ok: false as const, message: "کد تخفیف نامعتبر است." };
        }
        set({ discount: resolved });
        return { ok: true as const };
      },
      clearDiscount: () => set({ discount: null }),
    }),
    {
      name: "mojasame-saidi-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        lines: s.lines,
        discount: s.discount,
      }),
    },
  ),
);
