"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptionalNavigation } from "@/components/layout/navigation-context";

type Item =
  | {
      id: string;
      type: "link";
      href: string;
      label: string;
      icon: typeof Home;
      match: (path: string) => boolean;
    }
  | {
      id: string;
      type: "search";
      label: string;
      icon: typeof Search;
    };

const items: Item[] = [
  {
    id: "home",
    type: "link",
    href: "/",
    label: "خانه",
    icon: Home,
    match: (p) => p === "/",
  },
  {
    id: "categories",
    type: "link",
    href: "/categories",
    label: "دسته‌ها",
    icon: LayoutGrid,
    match: (p) => p.startsWith("/categories"),
  },
  {
    id: "search",
    type: "search",
    label: "جستجو",
    icon: Search,
  },
  {
    id: "favorites",
    type: "link",
    href: "/favorites",
    label: "علاقه‌مندی",
    icon: Heart,
    match: (p) => p.startsWith("/favorites"),
  },
  {
    id: "cart",
    type: "link",
    href: "/cart",
    label: "سبد",
    icon: ShoppingBag,
    match: (p) => p.startsWith("/cart"),
  },
];

function CartCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  const text = count > 99 ? "۹۹+" : count.toLocaleString("fa-IR");
  return (
    <span className="absolute -end-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold leading-none text-highlight-foreground">
      {text}
    </span>
  );
}

export type MobileBottomNavProps = {
  cartCount?: number;
  className?: string;
};

/**
 * نوار پایین موبایل — RTL، safe-area، جستجو مودال، انیمیشن Framer Motion
 */
export function MobileBottomNav({ cartCount = 0, className }: MobileBottomNavProps) {
  const pathname = usePathname();
  const navCtx = useOptionalNavigation();

  return (
    <nav
      aria-label="ناوبری اصلی موبایل"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-highlight/15 bg-background/86 pb-safe shadow-float backdrop-blur-xl md:hidden",
        className,
      )}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-1.5 pt-1">
        {items.map((item) => {
          const active =
            item.type === "link"
              ? item.match(pathname)
              : pathname.startsWith("/search");

          const content = (
            <>
              <span className="relative flex flex-col items-center">
                <item.icon
                  className={cn(
                    "size-6 shrink-0 stroke-[1.85] transition-colors",
                    active ? "text-highlight drop-shadow" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
                {item.id === "cart" ? <CartCountBadge count={cartCount} /> : null}
                <span
                  className={cn(
                    "mt-1 h-1 w-6 rounded-full transition-colors",
                    active ? "bg-highlight/90 shadow-[0_0_16px_hsl(var(--highlight)/0.45)]" : "bg-transparent",
                  )}
                  aria-hidden
                />
              </span>
              <span
                className={cn(
                  "max-w-full truncate text-[0.62rem] font-bold leading-tight sm:text-[0.65rem]",
                  active ? "text-highlight" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </>
          );

          if (item.type === "search") {
            return (
              <li key={item.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => navCtx?.openSearch()}
                  className={cn(
                    "flex min-h-touch w-full flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-center transition-colors",
                    active ? "bg-highlight/10 text-highlight" : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                  aria-label="جستجو در محصولات"
                >
                  {content}
                </button>
              </li>
            );
          }

          return (
            <li key={item.id} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-touch flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-center transition-colors",
                  active ? "bg-highlight/10 text-highlight" : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
