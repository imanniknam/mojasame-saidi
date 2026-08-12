import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * سقف زمان تراکنش‌ها، سراسری.
 *
 * دیتابیس تولید روی همین سرور نیست و هر رفت‌وبرگشت حدود نیم ثانیه طول
 * می‌کشد. تراکنش‌های این پروژه چند کوئری پشت‌سرهم دارند — مثلاً ذخیره‌ی
 * محصول: به‌روزرسانی محصول، upsert موجودی، حذف و ساخت دوباره‌ی تصاویر و
 * واریانت‌ها، و خواندن نهایی — که با پیش‌فرض ۵ ثانیه‌ی Prisma رد می‌شد و
 * کاربر در پنل پیام «اتصال دیتابیس را بررسی کنید» می‌گرفت.
 *
 * این تنظیم علامت را می‌پوشاند نه علت را: راه‌حل واقعی آوردن PostgreSQL
 * روی همین VPS است تا تأخیر از نیم‌ثانیه به میکروثانیه برسد.
 */
const transactionOptions = {
  timeout: 20_000,
  maxWait: 10_000,
};

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ transactionOptions });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}