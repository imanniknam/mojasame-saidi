# `src/server`

| پوشه | نقش |
|------|-----|
| `queries/` | توابع خواندن داده برای Server Components؛ بدون اثر جانبی |
| `actions/` | Server Actions — نام فایل `*.actions.ts` |
| `validations/` | اسکیمای Zod مشترک بین actions و API |

هیچ‌کدام از این پوشه‌ها نباید مستقیماً از کامپوننت `"use client"` ایمپورت شوند.
