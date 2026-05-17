# پنل مدیریت (`/admin`)

معماری App Router با گروه مسیرهای محافظت‌شده.

## ساختار

```
admin/
  layout.tsx              # ریشه ادمین (بدون shell)
  (auth)/login/           # ورود — بدون سایدبار
  (panel)/                # داشبورد و بخش‌ها — AdminShell
    layout.tsx
    loading.tsx | error.tsx
    page.tsx              # داشبورد
    products/ categories/ orders/ customers/
    homepage/ settings/
  logout/route.ts
```

## محافظت

- **Middleware:** `src/middleware.ts` — کوکی session و نقش `ADMIN`
- **Layout پنل:** `getActiveSessionUser()` + redirect به `/admin/login`
- **API:** `requireActiveAdmin()` در `src/app/api/admin/**`

## کامپوننت‌ها

`src/components/admin/` — Shell، Sidebar، DataTable، Empty/Loading/Error

## داده

`src/lib/admin/queries.ts` — کوئری‌های Prisma مشترک برای صفحات لیست.
