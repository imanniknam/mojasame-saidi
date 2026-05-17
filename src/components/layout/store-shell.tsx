"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { useCartHydration } from "@/hooks/use-cart-hydration";
import { useFavoritesHydration } from "@/hooks/use-favorites-hydration";
import { useSession } from "@/hooks/use-session";

export function StoreShell({ children }: { children: React.ReactNode }) {
  useCartHydration();
  useFavoritesHydration();
  const { user } = useSession();
  const cartCount = useCartStore((s) =>
    s.lines.reduce((acc, l) => acc + l.quantity, 0),
  );
  const wishlistCount = useFavoritesStore((s) => s.items.length);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader cartCount={cartCount} wishlistCount={wishlistCount} user={user} />
      <div className="flex-1">{children}</div>
      <MobileBottomNav cartCount={cartCount} />
    </div>
  );
}
