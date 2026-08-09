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
    label: "مجموعه‌ها",
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
    <span
      data-numeric
      className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground"
    >
      {text}
    </span>
  );
}

export type MobileBottomNavProps = {
  cartCount?: number;
  className?: string;
};

/** نوار پایین موبایل — RTL، safe-area، جستجوی مودال */
export function MobileBottomNav({ cartCount = 0, className }: MobileBottomNavProps) {
  const pathname = usePathname();
  const navCtx = useOptionalNavigation();

  return (
    <nav
      aria-label="ناوبری اصلی موبایل"
      className={cn(
        // lg و نه md — هدر دسکتاپ از lg شروع می‌شود؛ اگر اینجا md بماند
        // بین ۷۶۸ تا ۱۰۲۴ پیکسل هیچ ناوبری‌ای روی صفحه نیست.
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-safe backdrop-blur-xl lg:hidden",
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
                    "size-[1.35rem] shrink-0 stroke-[1.6] transition-colors duration-fast",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
                {item.id === "cart" ? <CartCountBadge count={cartCount} /> : null}
                <span
                  className={cn(
                    "mt-1.5 h-px w-5 transition-colors duration-fast",
                    active ? "bg-primary" : "bg-transparent",
                  )}
                  aria-hidden
                />
              </span>
              <span
                className={cn(
                  "max-w-full truncate text-[0.625rem] font-medium leading-tight",
                  active ? "text-primary" : "text-muted-foreground",
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
                    "flex min-h-touch w-full flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-center transition-colors duration-fast",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
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
                  "flex min-h-touch flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-center transition-colors duration-fast",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
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
