"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ChevronDown,
  Heart,
  LayoutGrid,
  Menu,
  Package,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SITE_DOMAIN_LABEL } from "@/lib/constants/site";
import { NAV_CATEGORIES } from "@/lib/constants/nav-categories";
import { useNavigation } from "@/components/layout/navigation-context";

const MENU_LINKS = [
  { href: "/products", label: "همه محصولات" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
] as const;

export type NavUser = {
  name: string;
  email?: string;
  role?: "CUSTOMER" | "ADMIN";
};

export type SiteHeaderProps = {
  cartCount?: number;
  wishlistCount?: number;
  user?: NavUser | null;
  className?: string;
};

function CountPill({ count }: { count: number }) {
  if (count <= 0) return null;
  const text = count > 99 ? "۹۹+" : count.toLocaleString("fa-IR");
  return (
    <span className="absolute end-0.5 top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold leading-none text-highlight-foreground">
      {text}
    </span>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-accent text-xs font-bold text-accent-foreground shadow-elegant"
      aria-hidden
    >
      {initials || "؟"}
    </span>
  );
}

/** هدر فروشگاه — RTL، چسبان، دسکتاپ کامل، موبایل همبرگر + جستجوی مودال */
export function SiteHeader({
  cartCount = 0,
  wishlistCount = 0,
  user = null,
  className,
}: SiteHeaderProps) {
  const router = useRouter();
  const { openSearch } = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function onDesktopSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-transparent pt-safe transition-[border-color,box-shadow] duration-300",
        scrolled
          ? "border-highlight/15 bg-background/90 shadow-card backdrop-blur-xl"
          : "bg-background/72 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:bg-card/70 hover:text-highlight md:hidden"
                aria-label="باز کردن منو"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-0 p-0">
              <SheetHeader className="border-b border-border/60 p-5 pb-4">
                <SheetTitle className="text-start">منوی فروشگاه</SheetTitle>
              </SheetHeader>
              <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
                <nav
                  aria-label="منوی موبایل"
                  className="flex flex-col gap-1"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        openSearch();
                      }}
                      className="flex min-h-touch w-full items-center gap-3 rounded-xl px-3 text-start text-base font-medium text-foreground transition-colors hover:bg-muted/60"
                    >
                      <Search className="size-5 shrink-0 text-muted-foreground" />
                      جستجو
                    </button>
                  </div>
                  {MENU_LINKS.map((l) => (
                    <div key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-touch items-center rounded-xl px-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60"
                      >
                        {l.label}
                      </Link>
                    </div>
                  ))}
                  <div>
                    <Link
                      href="/categories"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-touch items-center gap-3 rounded-xl px-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60"
                    >
                      <LayoutGrid className="size-5 shrink-0 text-muted-foreground" />
                      همه دسته‌بندی‌ها
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/favorites"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-touch items-center gap-3 rounded-xl px-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60"
                    >
                      <Heart className="size-5 shrink-0 text-muted-foreground" />
                      علاقه‌مندی‌ها
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/cart"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-touch items-center gap-3 rounded-xl px-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60"
                    >
                      <ShoppingBag className="size-5 shrink-0 text-muted-foreground" />
                      سبد خرید
                    </Link>
                  </div>
                  <div className="mt-2 border-t border-border/60 pt-3">
                    {user ? (
                      <>
                        <p className="mb-2 px-3 text-sm font-semibold text-foreground">{user.name}</p>
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex min-h-touch items-center gap-3 rounded-xl px-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60"
                        >
                          <UserRound className="size-5 shrink-0 text-muted-foreground" />
                          حساب کاربری
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setMenuOpen(false)}
                          className="flex min-h-touch items-center gap-3 rounded-xl px-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60"
                        >
                          <Package className="size-5 shrink-0 text-muted-foreground" />
                          سفارش‌های من
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-touch items-center gap-3 rounded-xl px-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60"
                      >
                        <UserRound className="size-5 shrink-0 text-muted-foreground" />
                        ورود / ثبت‌نام
                      </Link>
                    )}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex min-h-touch min-w-0 flex-col justify-center rounded-xl px-1 py-0.5 text-start transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-highlight sm:text-[0.65rem]">
              {SITE_DOMAIN_LABEL}
            </span>
            <span className="truncate text-sm font-bold leading-tight text-foreground sm:text-base">
              مجسمه‌سازی سعیدی
            </span>
          </Link>
          {user ? (
            <span className="max-w-[7rem] truncate text-xs font-semibold text-highlight md:hidden">
              {user.name}
            </span>
          ) : null}
        </div>

        <form
          onSubmit={onDesktopSearch}
          className="mx-2 hidden min-w-0 max-w-md flex-1 md:block"
        >
          <Label htmlFor="nav-search-desktop" className="sr-only">
            جستجوی محصولات
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="nav-search-desktop"
              name="q"
              type="search"
              placeholder="جستجو در محصولات…"
              className="h-11 rounded-full border-highlight/15 bg-card/70 pe-10 shadow-inner placeholder:text-muted-foreground/70"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-card/70 hover:text-highlight md:hidden"
            aria-label="جستجو"
            onClick={openSearch}
          >
            <Search className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:bg-card/70 hover:text-highlight"
            aria-label={`علاقه‌مندی‌ها${wishlistCount ? `، ${wishlistCount.toLocaleString("fa-IR")} کالا` : ""}`}
            asChild
          >
            <Link href="/favorites">
              <Heart className="size-[1.35rem] stroke-[1.85]" />
              <CountPill count={wishlistCount} />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:bg-card/70 hover:text-highlight"
            aria-label={`سبد خرید${cartCount ? `، ${cartCount.toLocaleString("fa-IR")} کالا` : ""}`}
            asChild
          >
            <Link href="/cart">
              <ShoppingBag className="size-[1.35rem] stroke-[1.85]" />
              <CountPill count={cartCount} />
            </Link>
          </Button>

          <div className="hidden h-8 w-px bg-highlight/15 md:block" aria-hidden />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden h-10 gap-1.5 rounded-full border-highlight/25 bg-card/55 px-3 font-semibold md:inline-flex"
              >
                <LayoutGrid className="size-4" aria-hidden />
                دسته‌ها
                <ChevronDown className="size-3.5 opacity-70" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-start">دسته‌بندی</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/categories">همه دسته‌ها</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {NAV_CATEGORIES.slice(0, 12).map((c) => (
                <DropdownMenuItem key={c.href} asChild className="cursor-pointer">
                  <Link href={c.href}>{c.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/categories">مشاهده همه…</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 gap-2 rounded-full ps-1.5 pe-3 hover:bg-muted/60"
                      aria-label="حساب کاربری"
                    >
                      <UserAvatar name={user.name} />
                      <span className="max-w-[6.5rem] truncate text-sm font-semibold">
                        {user.name}
                      </span>
                      <ChevronDown className="size-3.5 opacity-60" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-start font-normal">
                      <span className="block text-sm font-semibold">{user.name}</span>
                      {user.email ? (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      ) : null}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "ADMIN" ? (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">پنل مدیریت</Link>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/profile">پروفایل</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/orders">سفارش‌ها</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/favorites">علاقه‌مندی</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/logout">خروج</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex">
                <Button variant="luxury" size="sm" className="rounded-full px-4" asChild>
                  <Link href="/login">ورود</Link>
                </Button>
              </div>
            )}
        </div>
      </div>
    </header>
  );
}
