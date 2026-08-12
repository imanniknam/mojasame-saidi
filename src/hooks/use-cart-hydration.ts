"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/stores";

/** باید یک‌بار در ریشه‌ی کلاینت فروشگاه فراخوانی شود تا persist فعال شود. */
export function useCartHydration() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const markReady = () => {
      if (active) setReady(true);
    };
    const unsubscribe = useCartStore.persist.onFinishHydration(markReady);

    if (useCartStore.persist.hasHydrated()) {
      markReady();
    } else {
      void useCartStore.persist.rehydrate();
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return ready;
}
