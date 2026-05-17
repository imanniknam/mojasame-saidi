"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/stores";

/** باید یک‌بار در ریشه‌ی کلاینت فروشگاه فراخوانی شود تا persist فعال شود. */
export function useCartHydration() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void useCartStore.persist.rehydrate();
    setReady(true);
  }, []);

  return ready;
}
