## قرارداد `app/api`

| نوع نیاز | محل پیشنهادی |
|-----------|----------------|
| جهش داده از UI داخلی | `src/server/actions/*.actions.ts` |
| وب‌هوک پرداخت / پیامک | `app/api/webhooks/.../route.ts` |
| آپلود فایل (multipart) | `app/api/admin/uploads/route.ts` |
| یکپارچه‌سازی REST بیرونی | `app/api/integrations/...` |

همیشه:

- اعتبارسنجی ورودی (Zod)
- پاسخ‌های خطای یکنواخت (`src/types/api.ts`)
- عدم افشای جزئیات داخلی در خطاهای عمومی
