import { z } from "zod";

const mobileRegex = /^09[0-9]{9}$/;

/** مرحله ۱ — آدرس و تماس */
export const checkoutAddressSchema = z.object({
  recipientFa: z
    .string({ required_error: "نام گیرنده را وارد کنید." })
    .trim()
    .min(2, "نام گیرنده را کامل‌تر وارد کنید.")
    .max(80, "نام گیرنده خیلی طولانی است."),
  phone: z
    .string({ required_error: "شماره موبایل را وارد کنید." })
    .transform((s) => s.replace(/\s/g, ""))
    .refine((s) => mobileRegex.test(s), "شماره موبایل معتبر نیست (مثلاً ۰۹۱۲۳۴۵۶۷۸۹)."),
  provinceFa: z
    .string({ required_error: "استان را وارد کنید." })
    .trim()
    .min(2, "نام استان را وارد کنید."),
  cityFa: z
    .string({ required_error: "شهر را وارد کنید." })
    .trim()
    .min(2, "نام شهر را وارد کنید."),
  line1: z
    .string({ required_error: "آدرس را وارد کنید." })
    .trim()
    .min(8, "آدرس را دقیق‌تر وارد کنید."),
  plaque: z.string().trim().max(30).optional().or(z.literal("")),
  unit: z.string().trim().max(20).optional().or(z.literal("")),
  postalCode: z.string().trim().max(12).optional().or(z.literal("")),
});

export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;

export const checkoutShippingSchema = z.object({
  method: z.enum(["post", "courier"]),
});

export type CheckoutShipping = z.infer<typeof checkoutShippingSchema>;

export const checkoutPaymentSchema = z.object({
  method: z.enum(["card", "gateway"]),
});

export type CheckoutPayment = z.infer<typeof checkoutPaymentSchema>;
