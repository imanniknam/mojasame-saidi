"use client";

import { useEffect } from "react";
import { useCartHydration } from "@/hooks/use-cart-hydration";
import { useCartStore } from "@/lib/stores/cart-store";

/** سبد فقط پس از تأیید قطعی پرداخت پاک می‌شود؛ لغو یا خطای درگاه آن را حفظ می‌کند. */
export function PaymentResultCartCleanup() {
  const ready = useCartHydration();
  const clearCart = useCartStore((state) => state.clear);

  useEffect(() => {
    if (ready) clearCart();
  }, [clearCart, ready]);

  return null;
}
