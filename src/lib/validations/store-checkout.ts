import { z } from "zod";
import { normalizeDigits } from "@/lib/validations/auth";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => normalizeDigits(value).replace(/[^\d]/g, ""))
  .pipe(z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست."));

export const storeCheckoutSchema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
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
    postalCode: z.string().trim().optional(),
    addressLine: z.string().trim().min(8, "آدرس را دقیق‌تر وارد کنید."),
    notes: z.string().trim().optional(),
  }),
});

export type StoreCheckoutPayload = z.infer<typeof storeCheckoutSchema>;
