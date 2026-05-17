# معماری پنل ادمین

## مسیرها (پیاده‌سازی فعلی)

| ناحیه | مسیر |
|--------|------|
| ورود | `/admin/login` — گروه `(auth)`، بدون shell |
| داشبورد | `/admin` |
| محصولات | `/admin/products` |
| دسته‌ها | `/admin/categories` |
| سفارش‌ها | `/admin/orders` — لیست، فیلتر، جزئیات `/admin/orders/[id]` |
| مشتریان | `/admin/customers` |
| صفحه اصلی (بنر + سکشن) | `/admin/homepage` |
| تنظیمات فروشگاه | `/admin/settings` |

## ساختار کد

- **Shell:** `src/components/admin/admin-shell.tsx` — سایدبار دسکتاپ، Sheet موبایل، topbar
- **ناوبری:** `src/lib/admin/navigation.ts`
- **کوئری‌ها:** `src/lib/admin/queries.ts`
- **مسیرها:** `src/app/(admin)/admin/(panel)/` — layout محافظت‌شده + `loading` / `error`

## امنیت

1. `src/middleware.ts` — کوکی `mojasame_session` و نقش `ADMIN`
2. `(panel)/layout.tsx` — `getActiveSessionUser()` + redirect
3. APIها — `requireActiveAdmin()` در `src/app/api/admin/**`

## UI

- RTL فارسی، mobile-first، تم تیره luxury (همان توکن‌های `globals.css`)
- کامپوننت‌های مشترک: `AdminDataTable`, `AdminEmptyState`, `AdminLoadingState`, `AdminErrorState`

## فاز بعد

- فرم‌های CRUD متصل به API موجود
- API سفارش، مشتری، بنر، `StoreSettings`
- ویرایشگر drag-and-drop صفحه اصلی

جزئیات مسیرها: `src/app/(admin)/admin/README.md`
