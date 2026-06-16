"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { formatPriceFa } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StoreVariant } from "@/lib/storefront/types";

type ProductBuyBoxProps = {
  productId: string;
  titleFa: string;
  priceMinor: number;
  compareAtMinor?: number;
  imageUrl: string;
  inStock: boolean;
  variants: StoreVariant[];
};

export function ProductBuyBox({
  productId,
  titleFa,
  priceMinor,
  compareAtMinor,
  imageUrl,
  inStock,
  variants,
}: ProductBuyBoxProps) {
  const hasVariants = variants.length > 0;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = variants.find((v) => v.id === selectedId);
  const activePrice = selected?.priceMinor ?? priceMinor;
  const activeCompareAt = selected?.compareAtMinor ?? compareAtMinor;
  const hasDiscount = activeCompareAt != null && activeCompareAt > activePrice;
  const canAdd = inStock && (!hasVariants || !!selectedId);

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-elegant">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">قیمت محصول</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-highlight">
            {formatPriceFa(activePrice)}
          </p>
        </div>
        {hasDiscount ? (
          <p className="text-sm text-muted-foreground line-through tabular-nums">
            {formatPriceFa(activeCompareAt!)}
          </p>
        ) : null}
      </div>

      {hasVariants ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">سایز را انتخاب کنید:</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedId(v.id)}
                className={cn(
                  "flex flex-col items-center rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  v.id === selectedId
                    ? "border-highlight bg-highlight/10 text-highlight shadow-sm ring-1 ring-highlight/40"
                    : "border-border/70 bg-card text-foreground hover:border-highlight/50 hover:bg-muted/30",
                )}
              >
                <span>{v.nameFa}</span>
                <span className="mt-0.5 text-xs tabular-nums opacity-70">
                  {formatPriceFa(v.priceMinor)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {canAdd || !hasVariants ? (
        <AddToCartButton
          productId={productId}
          variantId={selected?.id}
          variantNameFa={selected?.nameFa}
          titleFa={titleFa}
          priceMinor={activePrice}
          imageUrl={imageUrl}
          inStock={canAdd}
        />
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button variant="luxury" size="touch" className="flex-1" disabled>
            <ShoppingBag className="size-5" aria-hidden />
            ابتدا سایز انتخاب کنید
          </Button>
        </div>
      )}
    </div>
  );
}
