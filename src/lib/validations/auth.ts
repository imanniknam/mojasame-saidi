import { z } from "zod";

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export function normalizeDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit);
    if (persianIndex >= 0) return String(persianIndex);
    const arabicIndex = arabicDigits.indexOf(digit);
    return arabicIndex >= 0 ? String(arabicIndex) : digit;
  });
}

const phoneSchema = z
  .string({
    // بدون این، نبودِ فیلد پیام انگلیسیِ پیش‌فرض Zod را برمی‌گرداند
    required_error: "شماره موبایل را وارد کنید.",
    invalid_type_error: "شماره موبایل را وارد کنید.",
  })
  .trim()
  .transform((value) => normalizeDigits(value).replace(/[^\d]/g, ""))
  .pipe(z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست."));

/**
 * ورود با شماره موبایل.
 *
 * ایمیل حذف شد چون در ایران موبایل شناسه‌ی طبیعی خرید است و کاربر آن را به‌خاطر
 * دارد. `phoneSchema` ارقام فارسی و عربی را هم می‌پذیرد و نرمال می‌کند، پس
 * «۰۹۱۲۱۲۳۴۵۶۷» و «09121234567» هر دو کار می‌کنند.
 */
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z
    .string({ required_error: "رمز عبور را وارد کنید." })
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد."),
  mode: z.enum(["customer", "admin"]).default("customer"),
  remember: z.boolean().default(false),
  next: z.string().optional(),
});

/**
 * ثبت‌نام با شماره موبایل. ایمیل اختیاری است و فقط برای بازیابی رمز به کار می‌آید.
 *
 * فیلد خالی به `undefined` تبدیل می‌شود، نه رشته‌ی تهی — وگرنه چند حساب با
 * ایمیلِ "" ساخته می‌شد و ایندکس یکتای ایمیل روی دومی می‌شکست.
 */
export const signupSchema = z.object({
  name: z
    .string({ required_error: "نام و نام خانوادگی را وارد کنید." })
    .trim()
    .min(2, "نام و نام خانوادگی را وارد کنید.")
    .max(80),
  phone: phoneSchema,
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email("ایمیل معتبر نیست.").max(160).optional(),
  ),
  password: z
    .string({ required_error: "رمز عبور را وارد کنید." })
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.").max(128),
});

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string) {
  return normalizeDigits(phone).trim().replace(/[^\d]/g, "");
}

export function splitDisplayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? null,
    lastName: parts.slice(1).join(" ") || null,
    displayFa: name.trim(),
  };
}

export function safeNextPath(next: string | null | undefined, fallback: string) {
  if (next?.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return fallback;
}

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("ایمیل معتبر نیست.").max(160),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(20, "لینک بازیابی نامعتبر است."),
    password: z
    .string({ required_error: "رمز عبور را وارد کنید." })
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.").max(128),
    confirmPassword: z.string().min(8, "تکرار رمز عبور را وارد کنید.").max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند.",
    path: ["confirmPassword"],
  });
