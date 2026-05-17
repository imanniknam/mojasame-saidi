# معماری فروشگاه مجسمه‌سازی سعیدی (MojasameSaidi.ir)

این سند تصمیمات معماری، قرارداد نام‌گذاری و لایه‌بندی پروژه را ثبت می‌کند. پیاده‌سازی صفحات فروشگاه و پنل ادمین در فاز بعدی انجام می‌شود.

## 1) تصمیمات معماری

### App Router و RSC

- **صفحات و لایه‌ها (Server Components پیش‌فرض):** داده‌ی حساس و کوئری‌های سنگین در سرور؛ کاهش جاوااسکریپت سمت کلاینت و بهبود SEO و LCP.
- **Client Components تنها جایی که لازم است:** تعامل (سبد، فیلترهای لحظه‌ای، انیمیشن Framer Motion، فرم‌های چندمرحله‌ای)، با مرزهای کوچک و مشخص.

### داده و امنیت

- **Prisma + PostgreSQL:** منبع حقیقت برای کاتالوگ، سفارش، موجودی و تنظیمات.
- **جهش داده (mutations):** اولویت با **Server Actions** (اعتبارسنجی با Zod، کنترل نقش، Idempotency برای پرداخت در آینده).
- **Route Handlers (`app/api/**/route.ts`):** برای وب‌هوک، آپلود فایل/استریم، یکپارچه‌سازی با سرویس‌های بیرونی، یا کلاینت‌های غیر React در صورت نیاز.

### RTL و چندزبانه

- ریشه‌ی UI با **`dir="rtl"`** و **`lang="fa"`** در لایه‌ی ریشه.
- Tailwind با پشتیبانی منطقی (`ms-`, `pe-`, `start`, `end`) تا استایل‌ها با RTL سازگار بمانند.
- تایپوگرافی فارسی (مثلاً Vazirmatn) از طریق `next/font` در `layout` ریشه.

### SEO

- `metadata` و `generateMetadata` در لایه‌های مناسب؛ `robots`/`sitemap` در مسیرهای استاندارد App Router؛ JSON-LD برای `Product` در صفحه‌ی محصول (فاز بعد).

### عملکرد تصویر

- **`next/image`** با `sizes` دقیق برای موبایل؛ اولویت با فرمت‌های مدرن در CDN/استوریج.
- قرارداد مسیر: فایل‌های آپلود ادمین در `public/uploads` (یا S3 در تولید)؛ تنها URL پایدار در دیتابیس ذخیره شود.

### وضعیت سمت کلاینت

- **Zustand + persist (اختیاری):** سبد مهمان و ترجیحات سبک تا بدون لاگین هم تجربه‌ی سریع بماند؛ پس از لاگین همگام‌سازی با سرور.
- **URL به‌عنوان منبع حقیقت فیلترها:** قابل اشتراک‌گذاری و کش دوستانه برای SEO دسته‌ها.

### پنل ادمین

- گروه مسیر **`(admin)`** جدا از فروشگاه برای میان‌افزار، مجوز و layout متفاوت.
- دسترسی ادمین فقط از طریق احراز هویت سروری (مثلاً NextAuth / session role) + محافظت در `middleware` و تکرار کنترل در هر Server Action.

## 2) ساختار پوشه‌ها (خلاصه)

```
src/
  app/
    (store)/          # فروشگاه: layout و صفحات آینده (محصول، سبد، ...)
    (admin)/admin/  # پنل مدیریت: layout و صفحات آینده
    api/              # Route handlers (وب‌هوک، آپلود، ...)
  components/
    ui/               # shadcn/ui — بدون منطق دامنه
    layout/           # هدر، فوتر، ناوبری موبایل
    store/            # کارت محصول، گالری، لیست — فقط UI مشترک فروشگاه
    admin/            # کامپوننت‌های مشترک پنل ادمین
    shared/           # غیراختصاصی (مثلاً Logo, Section)
  lib/                # پیکربندی، prisma، فرمت قیمت، SEO، تصویر
  server/
    actions/          # server actions — نام فایل: *.actions.ts
    queries/          # خواندن داده برای RSC
    validations/      # اسکیمای Zod مشترک
  types/              # تایپ‌های API و دامنه
  hooks/              # هوک‌های React سبک
```

## 3) قرارداد نام‌گذاری

| ناحیه | قرارداد | مثال |
|--------|---------|------|
| پوشه‌ها | kebab-case | `product-card/` |
| کامپوننت React | PascalCase | `ProductCard.tsx` |
| هوک‌ها | camelCase با پیشوند use | `useMediaQuery.ts` |
| Server Actions | suffix `.actions.ts` | `cart.actions.ts` |
| اعتبارسنجی | suffix `.schema.ts` | `checkout.schema.ts` |
| کوئری‌های سرور | suffix `.queries.ts` | `product.queries.ts` |
| تایپ‌ها | PascalCase برای اینترفیس/نوع | `CartLine` |

## 4) API و مرز لایه‌ها

- **خواندن برای RSC:** `src/server/queries/*` — بدون اکسپورت مستقیم Prisma به کامپوننت‌های کلاینت.
- **نوشتن:** `src/server/actions/*` — ورودی Zod، برگرداندن `{ ok, error }` یا `revalidatePath`.
- **`app/api`:** فقط در صورت نیاز به پروتکل HTTP خالص؛ سند همین مخزن در `src/app/api/README.md`.

## 5) مدیریت تصویر

- `src/lib/images/*` — اندازه‌های پیشنهادی، helper برای `sizes`، و قرارداد مسیر آپلود.
- ادمین: آپلود → ذخیره‌ی فایل + رکورد در DB؛ فروشگاه: فقط خواندن URL و `Image` با priority کنترل‌شده.

## 6) وابستگی‌های کلیدی (پشته)

Next.js (App Router)، TypeScript، Tailwind، shadcn/ui (Radix)، Prisma، PostgreSQL، Framer Motion، Zod، Zustand (سبد/ترجیحات سبک).
