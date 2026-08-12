import { z } from "zod";
import { normalizeDigits } from "@/lib/validations/auth";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => normalizeDigits(value).replace(/[^\d]/g, ""))
  .pipe(z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست."));

/**
 * کد پستی هم مثل شماره موبایل نرمال می‌شود.
 *
 * قبلاً سرور روی رشته‌ی خام `min(10).max(10)` می‌زد، ولی فرم کلاینت پیش از
 * اعتبارسنجی ارقام فارسی را لاتین و جداکننده‌ها را حذف می‌کند. نتیجه این بود
 * که «۱۲۳۴۵-۶۷۸۹۰» از نظر کاربر درست بود، فرم قبولش می‌کرد، و سرور همان
 * سفارش را با ۴۲۲ رد می‌کرد.
 */
const postalCodeSchema = z
  .string({ required_error: "کد پستی را وارد کنید." })
  .trim()
  .transform((value) => normalizeDigits(value).replace(/[^\d]/g, ""))
  .pipe(z.string().regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد."));

export const storeCheckoutSchema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        /**
         * بدون این فیلد، Zod آن را از payload حذف می‌کرد و سرور قیمت را با
         * قیمت پایه‌ی محصول می‌سنجید — یعنی هر محصولِ سایزدار با خطای
         * «قیمت محصول تغییر کرده است» رد می‌شد و اصلاً قابل خرید نبود.
         */
        variantId: z.string().min(1).optional(),
        quantity: z.number().int().min(1).max(99),
        unitMinor: z.number().int().min(0),
      }),
    )
    .min(1, "سبد خرید خالی است."),
  discount: z
    .object({
      code: z.string(),
      type: z.enum(["PERCENT", "FIXED_MINOR"]),
      value: z.number(),
      maxMinor: z.number().optional(),
    })
    .nullable()
    .optional(),
  shipping: z.enum(["standard", "express", "pickup"]),
  payment: z.enum(["online", "cardToCard"]),
  address: z.object({
    fullName: z.string().trim().min(2, "نام گیرنده را وارد کنید."),
    phone: phoneSchema,
    province: z.string().trim().min(2, "استان را وارد کنید."),
    city: z.string().trim().min(2, "شهر را وارد کنید."),
    postalCode: postalCodeSchema,
    addressLine: z.string().trim().min(8, "آدرس را دقیق‌تر وارد کنید."),
    notes: z.string().trim().optional(),
  }),
});

export type StoreCheckoutPayload = z.infer<typeof storeCheckoutSchema>;
