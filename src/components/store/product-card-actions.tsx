"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { Check, Heart, Loader2, Ruler, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { cn } from "@/lib/utils";

let cartRehydrateStarted = false;

/**
 * کنش‌های کارت محصول به دو قطعه‌ی مستقل شکسته شده‌اند تا کارت بتواند
 * قلب را روی تصویر و دکمه‌ی سبد را در نوار اطلاعات بنشاند (مطابق طرح).
 */

export type FavoriteToggleProps = {
  productId: string;
  titleFa: string;
  imageUrl: string;
  priceMinor?: number;
  href?: string;
  defaultFavorite?: boolean;
  className?: string;
};

export function FavoriteToggle({
  productId,
  titleFa,
  imageUrl,
  priceMinor,
  href = "#",
  defaultFavorite = false,
  className,
}: FavoriteToggleProps) {
  const [favorite, setFavorite] = useState(defaultFavorite);
  const storedFavorite = useFavoritesStore((state) => state.has(productId));
  const toggleStoredFavorite = useFavoritesStore((state) => state.toggle);

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

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-pressed={favorite}
      aria-label={favorite ? `حذف ${titleFa} از علاقه‌مندی‌ها` : `افزودن ${titleFa} به علاقه‌مندی‌ها`}
      className={cn(
        "ds-touch-target inline-flex items-center justify-center rounded-sm border border-border/70 bg-background/70 text-muted-foreground backdrop-blur-sm",
        "transition-colors duration-fast ease-out hover:border-primary/50 hover:text-primary",
        favorite && "border-primary/50 text-primary",
        className,
      )}
    >
      <Heart
        className={cn("size-[1.15rem]", favorite ? "fill-current stroke-[2]" : "stroke-[1.6]")}
        aria-hidden
      />
    </button>
  );
}

export type QuickAddButtonProps = {
  productId: string;
  titleFa: string;
  imageUrl: string;
  priceMinor?: number;
  /** لینک صفحه‌ی محصول — در سبد ذخیره می‌شود */
  href?: string;
  className?: string;
  /** حالت آیکونی برای نوار اطلاعات کارت */
  compact?: boolean;
  /**
   * محصول سایز دارد؟ اگر بله، افزودن سریع معنی ندارد — کاربر باید در صفحه‌ی
   * محصول سایز را انتخاب کند، وگرنه خطی با قیمت پایه و بدون سایز ساخته می‌شود.
   */
  hasVariants?: boolean;
};

export function QuickAddButton({
  productId,
  titleFa,
  imageUrl,
  priceMinor,
  href,
  className,
  compact = false,
  hasVariants = false,
}: QuickAddButtonProps) {
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");

  useEffect(() => {
    if (!cartRehydrateStarted) {
      cartRehydrateStarted = true;
      void useCartStore.persist.rehydrate();
    }
  }, []);

  const handleQuickAdd = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (priceMinor == null) return;

      setState("adding");
      const { lines, addLine, setQuantity } = useCartStore.getState();
      // فقط خطِ بدون سایز؛ وگرنه کلیک روی کارت، تعدادِ سایزِ انتخاب‌شده‌ی
      // دیگری را زیاد می‌کرد و مشتری قیمت اشتباه می‌پرداخت.
      const existing = lines.find(
        (line) => line.productId === productId && !line.variantId,
      );
      if (existing) {
        setQuantity(existing.id, existing.quantity + 1);
      } else {
        addLine({ productId, titleFa, unitMinor: priceMinor, quantity: 1, imageUrl, href });
      }
      window.setTimeout(() => setState("added"), 250);
      window.setTimeout(() => setState("idle"), 1600);
    },
    [productId, titleFa, priceMinor, imageUrl, href],
  );

  if (priceMinor == null) return null;

  // محصول سایزدار: به‌جای افزودن، به صفحه‌ی محصول می‌فرستیم تا سایز انتخاب شود.
  if (hasVariants) {
    return (
      <Link
        href={href ?? "/products"}
        aria-label={`انتخاب سایز برای ${titleFa}`}
        className={cn(
          "ds-touch-target inline-flex items-center justify-center rounded-sm border border-border/70 text-muted-foreground",
          "transition-colors duration-fast ease-out hover:border-primary/50 hover:text-primary",
          className,
        )}
      >
        <Ruler className="size-[1.05rem] stroke-[1.6]" aria-hidden />
      </Link>
    );
  }

  const Icon = state === "adding" ? Loader2 : state === "added" ? Check : ShoppingBag;

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleQuickAdd}
        disabled={state === "adding"}
        aria-label={`افزودن ${titleFa} به سبد خرید`}
        className={cn(
          "ds-touch-target inline-flex items-center justify-center rounded-sm border border-border/70 text-muted-foreground",
          "transition-colors duration-fast ease-out hover:border-primary/50 hover:text-primary",
          state === "added" && "border-primary/50 text-primary",
          className,
        )}
      >
        <Icon
          className={cn("size-[1.05rem] stroke-[1.6]", state === "adding" && "animate-spin")}
          aria-hidden
        />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="luxury"
      size="touch"
      disabled={state === "adding"}
      onClick={handleQuickAdd}
      className={cn("w-full gap-2 text-sm font-bold", className)}
    >
      <Icon
        className={cn("size-[1.15rem]", state === "adding" && "animate-spin")}
        aria-hidden
      />
      <span>{state === "added" ? "به سبد اضافه شد" : "افزودن به سبد"}</span>
    </Button>
  );
}
