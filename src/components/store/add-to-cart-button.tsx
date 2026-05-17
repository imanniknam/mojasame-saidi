"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartHydration } from "@/hooks/use-cart-hydration";

type AddToCartButtonProps = {
  productId: string;
  titleFa: string;
  priceMinor: number;
  imageUrl: string;
  inStock: boolean;
};

export function AddToCartButton({
  productId,
  titleFa,
  priceMinor,
  imageUrl,
  inStock,
}: AddToCartButtonProps) {
  useCartHydration();
  const [adding, setAdding] = useState(false);

  function handleAdd() {
    if (!inStock) return;
    setAdding(true);
    try {
      const { lines, addLine, setQuantity } = useCartStore.getState();
      const existing = lines.find((line) => line.productId === productId);
      if (existing) {
        setQuantity(existing.id, existing.quantity + 1);
      } else {
        addLine({ productId, titleFa, unitMinor: priceMinor, quantity: 1, imageUrl });
      }
    } finally {
      window.setTimeout(() => setAdding(false), 400);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <Button
        variant="luxury"
        size="touch"
        className="flex-1"
        disabled={!inStock || adding}
        onClick={handleAdd}
      >
        {adding ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <ShoppingBag className="size-5" aria-hidden />
        )}
        {inStock ? "افزودن به سبد" : "ناموجود"}
      </Button>
      <Button variant="outline" size="touch" className="flex-1" asChild>
        <Link href="/cart">مشاهده سبد خرید</Link>
      </Button>
    </div>
  );
}
