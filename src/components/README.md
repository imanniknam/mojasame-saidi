# کامپوننت‌ها

## سیستم طراحی (فروشگاه لوکس RTL)

- **توکن‌ها:** `src/app/globals.css` — رنگ، سایه، تایپوگرافی، فاصله‌گذاری، safe-area
- **Tailwind:** `tailwind.config.ts` — نقشه‌ی رنگ `highlight`، `card-elevated`، سایه‌ها، `min-h-touch`
- **shadcn/ui:** `src/components/ui/*` — دکمه، کارت، ورودی، برچسب، دیالوگ، شیت، Sonner
- **فروشگاه:** `src/components/store/*` — `ProductCard`, `CategoryCard`
- **چیدمان:** `src/components/layout/*` — `SiteHeader` (لوگو، جستجو، منوی دسته، سبد، علاقه‌مندی، پروفایل)، `MobileBottomNav`، `NavigationProvider`، `SearchNavDialog`
- **ارائه‌دهنده:** `src/components/providers.tsx` — Toaster سراسری

## `admin/` و `shared/`

کامپوننت‌های اختصاصی پنل ادمین و بلوک‌های عمومی (به‌مرور اضافه می‌شوند).

### Framer Motion

انیمیشن‌های جزئی در کامپوننت‌های `"use client"`؛ همیشه `prefers-reduced-motion` را در فاز UI رعایت کنید.
