"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Heart,
  LogOut,
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
import { BrandMark } from "@/components/layout/brand-mark";
import { useNavigation } from "@/components/layout/navigation-context";

const NAV_LINKS = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/products", label: "محصولات" },
  { href: "/categories", label: "مجموعه‌ها" },
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
    <span
      data-numeric
      className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground"
    >
      {text}
    </span>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** هدر فروشگاه — RTL، چسبان، دو ردیفه در دسکتاپ، فشرده در موبایل */
export function SiteHeader({
  cartCount = 0,
  wishlistCount = 0,
  user = null,
  className,
}: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { openSearch } = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
        "sticky top-0 z-40 border-b pt-safe transition-colors duration-base",
        scrolled
          ? "border-border bg-background/95 backdrop-blur-xl"
          : "border-transparent bg-background",
        className,
      )}
    >
      {/* ——— موبایل ——— */}
      <div className="ds-container flex h-14 items-center justify-between gap-2 lg:hidden">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-primary"
              aria-label="باز کردن منو"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-[19rem] flex-col gap-0 p-0">
            <SheetHeader className="border-b border-border p-5">
              <SheetTitle className="text-start">
                <BrandMark orientation="horizontal" />
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="منوی موبایل" className="flex flex-1 flex-col overflow-y-auto p-3">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActivePath(pathname, l.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-touch items-center border-b border-border/60 px-2 text-[0.9375rem] font-medium transition-colors duration-fast",
                    isActivePath(pathname, l.href)
                      ? "text-primary"
                      : "text-foreground hover:text-primary",
                  )}
                >
                  {l.label}
                </Link>
              ))}

              <div className="mt-4 flex flex-col">
                <Link
                  href="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-touch items-center gap-3 px-2 text-[0.9375rem] text-foreground transition-colors hover:text-primary"
                >
                  <Heart className="size-[1.15rem] stroke-[1.6] text-muted-foreground" aria-hidden />
                  علاقه‌مندی‌ها
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-touch items-center gap-3 px-2 text-[0.9375rem] text-foreground transition-colors hover:text-primary"
                >
                  <ShoppingBag className="size-[1.15rem] stroke-[1.6] text-muted-foreground" aria-hidden />
                  سبد خرید
                </Link>

                <div className="mt-3 border-t border-border pt-3">
                  {user ? (
                    <>
                      <p className="mb-1 px-2 text-xs font-semibold text-primary">{user.name}</p>
                      <Link
                        href={user.role === "ADMIN" ? "/admin" : "/profile"}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-touch items-center gap-3 px-2 text-[0.9375rem] text-foreground transition-colors hover:text-primary"
                      >
                        <UserRound className="size-[1.15rem] stroke-[1.6] text-muted-foreground" aria-hidden />
                        {user.role === "ADMIN" ? "پنل مدیریت" : "حساب کاربری"}
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-touch items-center gap-3 px-2 text-[0.9375rem] text-foreground transition-colors hover:text-primary"
                      >
                        <Package className="size-[1.15rem] stroke-[1.6] text-muted-foreground" aria-hidden />
                        سفارش‌های من
                      </Link>
                      <Link
                        href="/logout"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-touch items-center gap-3 px-2 text-[0.9375rem] text-foreground transition-colors hover:text-primary"
                      >
                        <LogOut className="size-[1.15rem] stroke-[1.6] text-muted-foreground" aria-hidden />
                        خروج
                      </Link>
                    </>
                  ) : (
                    <Button variant="luxury" size="touch" className="w-full" asChild>
                      <Link href="/login" onClick={() => setMenuOpen(false)}>
                        ورود / ثبت‌نام
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" aria-label="صفحه اصلی">
          <BrandMark orientation="horizontal" />
        </Link>

        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            aria-label="جستجو"
            onClick={openSearch}
          >
            <Search className="size-5 stroke-[1.6]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-primary"
            aria-label={`سبد خرید${cartCount ? `، ${cartCount.toLocaleString("fa-IR")} کالا` : ""}`}
            asChild
          >
            <Link href="/cart">
              <ShoppingBag className="size-5 stroke-[1.6]" />
              <CountPill count={cartCount} />
            </Link>
          </Button>
        </div>
      </div>

      {/* ——— دسکتاپ: ردیف بالا ——— */}
      <div className="ds-container hidden grid-cols-[1fr_auto_1fr] items-center gap-6 py-4 lg:grid">
        {/* ابتدای سطر در RTL = راست → جستجو */}
        <form onSubmit={onDesktopSearch} className="min-w-0 max-w-xs">
          <Label htmlFor="nav-search-desktop" className="sr-only">
            جستجوی محصولات
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 stroke-[1.6] text-muted-foreground"
              aria-hidden
            />
            <Input
              id="nav-search-desktop"
              name="q"
              type="search"
              placeholder="جستجو در محصولات…"
              className="h-10 border-border bg-card pe-10 text-sm placeholder:text-muted-foreground/70"
            />
          </div>
        </form>

        <Link href="/" aria-label="صفحه اصلی" className="justify-self-center">
          <BrandMark orientation="vertical" />
        </Link>

        {/* انتهای سطر در RTL = چپ → آیکون‌های کاربر */}
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-primary"
            aria-label={`علاقه‌مندی‌ها${wishlistCount ? `، ${wishlistCount.toLocaleString("fa-IR")} کالا` : ""}`}
            asChild
          >
            <Link href="/favorites">
              <Heart className="size-[1.2rem] stroke-[1.6]" />
              <CountPill count={wishlistCount} />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-primary"
            aria-label={`سبد خرید${cartCount ? `، ${cartCount.toLocaleString("fa-IR")} کالا` : ""}`}
            asChild
          >
            <Link href="/cart">
              <ShoppingBag className="size-[1.2rem] stroke-[1.6]" />
              <CountPill count={cartCount} />
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                  aria-label={`حساب کاربری — ${user.name}`}
                >
                  <UserRound className="size-[1.2rem] stroke-[1.6]" />
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
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/logout">خروج</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              aria-label="ورود به حساب"
              asChild
            >
              <Link href="/login">
                <UserRound className="size-[1.2rem] stroke-[1.6]" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ——— دسکتاپ: ردیف ناوبری ——— */}
      <nav
        aria-label="ناوبری اصلی"
        className="ds-container hidden items-center justify-start gap-8 pb-3 lg:flex"
      >
        {NAV_LINKS.map((l) => {
          const active = isActivePath(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative py-1 text-sm font-medium transition-colors duration-fast",
                active ? "ds-keyline text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
