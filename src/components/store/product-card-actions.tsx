"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { Heart, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { cn } from "@/lib/utils";

let cartRehydrateStarted = false;

export type ProductCardActionsProps = {
  productId: string;
  titleFa: string;
  imageUrl: string;
  priceMinor?: number;
  href?: string;
  defaultFavorite?: boolean;
  showFavorite?: boolean;
  showQuickAdd?: boolean;
};

export function ProductCardActions({
  productId,
  titleFa,
  imageUrl,
  priceMinor,
  href = "#",
  defaultFavorite = false,
  showFavorite = true,
  showQuickAdd = true,
}: ProductCardActionsProps) {
  const [favorite, setFavorite] = useState(defaultFavorite);
  const [adding, setAdding] = useState(false);
  const storedFavorite = useFavoritesStore((state) => state.has(productId));
  const toggleStoredFavorite = useFavoritesStore((state) => state.toggle);

  useEffect(() => {
    if (!cartRehydrateStarted) {
      cartRehydrateStarted = true;
      void useCartStore.persist.rehydrate();
    }
  }, []);

  useEffect(() => {
    setFavorite(defaultFavorite || storedFavorite);
  }, [defaultFavorite, storedFavorite]);

  const toggleFavorite = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = toggleStoredFavorite({
        productId,
        titleFa,
        imageUrl,
        priceMinor,
        href,
      });
      setFavorite(next);
    },
    [href, imageUrl, priceMinor, productId, titleFa, toggleStoredFavorite],
  );

  const handleQuickAdd = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (priceMinor == null) {
        return;
      }

      setAdding(true);
      try {
        const { lines, addLine, setQuantity } = useCartStore.getState();
        const existing = lines.find((line) => line.productId === productId);
        if (existing) {
          setQuantity(existing.id, existing.quantity + 1);
        } else {
          addLine({
            productId,
            titleFa,
            unitMinor: priceMinor,
            quantity: 1,
            imageUrl,
          });
        }
      } finally {
        window.setTimeout(() => setAdding(false), 450);
      }
    },
    [productId, titleFa, priceMinor, imageUrl],
  );

  if (!showFavorite && (!showQuickAdd || priceMinor == null)) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[4] flex flex-col justify-between p-2 sm:p-2.5">
      <div className="flex justify-end">
        {showFavorite ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={toggleFavorite}
            aria-pressed={favorite}
            aria-label={
              favorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
            }
            className={cn(
              "pointer-events-auto ds-touch-target size-11 shrink-0 rounded-full border border-highlight/15 bg-background/75 shadow-elegant backdrop-blur-md transition-colors hover:border-highlight/35 hover:text-highlight md:size-10",
              favorite && "border-highlight/40 bg-highlight/15 text-highlight",
            )}
          >
            <span className="transition-transform duration-200 active:scale-90">
              <Heart
                className={cn(
                  "size-[1.25rem]",
                  favorite ? "fill-current stroke-[2]" : "stroke-[1.85]",
                )}
              />
            </span>
          </Button>
        ) : null}
      </div>

      {showQuickAdd && priceMinor != null ? (
        <div className="pointer-events-auto mt-auto flex justify-end">
          <div className="w-full max-md:translate-y-0 max-md:opacity-100 md:translate-y-1 md:opacity-0 md:transition-all md:duration-300 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100">
            <Button
              type="button"
              variant="luxury"
              size="touch"
              disabled={adding}
              onClick={handleQuickAdd}
              className="h-11 w-full gap-2 rounded-xl text-sm font-bold shadow-card sm:h-12 md:h-11"
              aria-label={`افزودن سریع ${titleFa} به سبد خرید`}
            >
              {adding ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <Plus className="size-5" aria-hidden />
              )}
              <span>افزودن به سبد</span>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
