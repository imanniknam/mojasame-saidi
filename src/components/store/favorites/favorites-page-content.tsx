"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPriceFa } from "@/lib/format";
import { useCartStore } from "@/lib/stores/cart-store";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { cn } from "@/lib/utils";
import { useCartHydration } from "@/hooks/use-cart-hydration";
import { useFavoritesHydration } from "@/hooks/use-favorites-hydration";

export function FavoritesPageContent() {
  useCartHydration();
  useFavoritesHydration();

  const favorites = useFavoritesStore((state) => state.items);
  const removeFavorite = useFavoritesStore((state) => state.remove);
  const clearFavorites = useFavoritesStore((state) => state.clear);
  const addLine = useCartStore((state) => state.addLine);
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);

  function addFavoriteToCart(item: (typeof favorites)[number]) {
    if (item.priceMinor == null) return;
    const existing = lines.find((line) => line.productId === item.productId);
    if (existing) {
      setQuantity(existing.id, existing.quantity + 1);
      return;
    }
    addLine({
      productId: item.productId,
      titleFa: item.titleFa,
      unitMinor: item.priceMinor,
      quantity: 1,
      imageUrl: item.imageUrl,
    });
  }

  return (
    <main className="ds-section mx-auto max-w-6xl space-y-6 pb-28">
      <header className="flex flex-col gap-4 rounded-[2rem] border border-highlight/15 bg-card/70 p-5 shadow-elegant sm:p-7 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2 text-start">
          <p className="ds-overline text-highlight">Wishlist</p>
          <h1 className="ds-display text-3xl">علاقه‌مندی‌ها</h1>
          <p className="ds-subtitle max-w-2xl">
            آثار منتخب شما برای مقایسه، خرید سریع یا نگهداری برای بعد.
          </p>
        </div>
        {favorites.length > 0 ? (
          <Button variant="outline" size="touch" onClick={clearFavorites}>
            پاک کردن همه
          </Button>
        ) : null}
      </header>

      {favorites.length === 0 ? (
        <Card
          elevated
          className="relative overflow-hidden rounded-[2rem] border-highlight/15 p-8 text-center"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--highlight)/0.12),transparent_18rem)]"
            aria-hidden
          />
          <div className="relative mx-auto flex max-w-md flex-col items-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full border border-highlight/20 bg-highlight/10 text-highlight">
              <Heart className="size-8" aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-foreground">هنوز محصولی ذخیره نشده</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              با لمس قلب روی کارت محصولات، آثار محبوبتان اینجا ذخیره می‌شوند.
            </p>
            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="luxury" size="touch" asChild>
                <Link href="/products">مشاهده محصولات</Link>
              </Button>
              <Button variant="outline" size="touch" asChild>
                <Link href="/categories">دسته‌بندی‌ها</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {favorites.map((item) => (
            <Card
              key={item.productId}
              elevated
              className="overflow-hidden rounded-[1.5rem] border-highlight/10 p-0"
            >
              <div className="grid grid-cols-[7.5rem_1fr] gap-0 sm:grid-cols-[10rem_1fr]">
                <Link
                  href={item.href}
                  className="relative block min-h-[9.5rem] overflow-hidden bg-background"
                  aria-label={`مشاهده ${item.titleFa}`}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.titleFa}
                    fill
                    sizes="160px"
                    className="object-cover opacity-95"
                    unoptimized={/\.svg$/i.test(item.imageUrl)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/55 to-transparent" />
                </Link>

                <div className="flex min-w-0 flex-col justify-between gap-4 p-4 text-start">
                  <div className="space-y-2">
                    <Link
                      href={item.href}
                      className="line-clamp-2 font-bold leading-7 text-foreground transition-colors hover:text-highlight"
                    >
                      {item.titleFa}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      ذخیره شده برای خرید بعدی
                    </p>
                    {item.priceMinor != null ? (
                      <p className="text-lg font-black text-highlight">
                        {formatPriceFa(item.priceMinor)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="luxury"
                      size="touch"
                      className={cn("flex-1", item.priceMinor == null && "opacity-60")}
                      disabled={item.priceMinor == null}
                      onClick={() => addFavoriteToCart(item)}
                    >
                      <ShoppingBag className="size-5" aria-hidden />
                      افزودن به سبد
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="touch"
                      onClick={() => removeFavorite(item.productId)}
                    >
                      <Trash2 className="size-5" aria-hidden />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
