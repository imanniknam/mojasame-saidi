# معماری پنل ادمین

## مسیرها

| ناحیه | مسیر پیشنهادی |
|--------|----------------|
| داشبورد | `/admin` |
| محصولات | `/admin/products` |
| دسته‌ها | `/admin/categories` |
| سفارش‌ها | `/admin/orders` |
| مشتریان | `/admin/customers` |
| بنر و اسلایدر | `/admin/content/banners` |
| سکشن‌های صفحه اصلی | `/admin/content/homepage` |
| تم و رنگ | `/admin/settings/theme` |
| تخفیف‌ها | `/admin/promotions/discounts` |

## الگوی داده

- **محتوا:** مدل‌های `SiteBanner`, `HomepageSection`, `ThemeSettings` در Prisma.
- **کاتالوگ:** `Product`, `ProductImage`, `Category` با کنترل موجودی `stock`.
- **سفارش:** `Order`, `OrderItem` با `OrderStatus` و `trackingToken` برای پیگیری عمومی.

## امنیت

1. `middleware.ts` — محدود کردن `/admin` به session معتبر.
2. هر Server Action ادمین — `assertAdmin(session.user)` در ابتدای تابع.
3. آپلود تصویر — اندپوینت جدا با محدودیت نوع MIME، اندازه، و نام فایل امن؛ ذخیره خارج از webroot در تولید (S3/ابجکت استوریج).

## UI

- جدا از shadcn/ui فروشگاه؛ می‌توان تم تیره‌تر یا چگالی بالاتر برای کارایی ادمین انتخاب کرد.
- جداول مجازی‌سازی‌شده برای سفارش‌های پرحجم در فاز بعد.
