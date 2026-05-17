import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutGrid,
  Package,
  ShoppingBag,
  Users,
  PanelsTopLeft,
  Settings,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  /** Prefix match for active state */
  match?: (pathname: string) => boolean;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "داشبورد",
    description: "نمای کلی فروشگاه",
    icon: Home,
    match: (pathname) => pathname === "/admin",
  },
  {
    href: "/admin/products",
    label: "محصولات",
    description: "کاتالوگ و موجودی",
    icon: Package,
    match: (pathname) => pathname.startsWith("/admin/products"),
  },
  {
    href: "/admin/categories",
    label: "دسته‌بندی‌ها",
    description: "ساختار دسته‌ها",
    icon: LayoutGrid,
    match: (pathname) => pathname.startsWith("/admin/categories"),
  },
  {
    href: "/admin/orders",
    label: "سفارش‌ها",
    description: "پیگیری و وضعیت",
    icon: ShoppingBag,
    match: (pathname) => pathname.startsWith("/admin/orders"),
  },
  {
    href: "/admin/customers",
    label: "مشتریان",
    description: "حساب‌ها و خریدها",
    icon: Users,
    match: (pathname) => pathname.startsWith("/admin/customers"),
  },
  {
    href: "/admin/homepage",
    label: "صفحه اصلی",
    description: "بنر، سکشن‌ها، محصولات ویژه",
    icon: PanelsTopLeft,
    match: (pathname) => pathname.startsWith("/admin/homepage"),
  },
  {
    href: "/admin/settings",
    label: "تنظیمات",
    description: "برند، تم و فروشگاه",
    icon: Settings,
    match: (pathname) => pathname.startsWith("/admin/settings"),
  },
];

export function getAdminNavItem(pathname: string) {
  return adminNavItems.find((item) => item.match?.(pathname)) ?? adminNavItems[0];
}
