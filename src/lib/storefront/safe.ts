import { logger } from "@/lib/server/logger";

/**
 * اجرای یک کوئری خواندنیِ فروشگاه با تنزل تدریجی.
 *
 * صفحه‌ی اصلی از چند بخش مستقل ساخته شده. اگر دیتابیس لحظه‌ای در دسترس نباشد،
 * برگرداندن ۵۰۰ برای کل صفحه بدترین نتیجه است: بازدیدکننده صفحه‌ی سفید می‌بیند.
 * به‌جای آن، بخشِ خراب حذف می‌شود و بقیه‌ی صفحه سالم رندر می‌شود.
 *
 * خطا هرگز بی‌صدا بلعیده نمی‌شود — با سطح error لاگ می‌شود تا در مانیتورینگ دیده شود.
 */
export async function safeQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    // پیام خطاهای Prisma با چند خط خالی شروع می‌شود، پس اولین خطِ غیرخالی را برمی‌داریم.
    const raw = error instanceof Error ? error.message : String(error);
    const firstLine = raw
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    logger.error("storefront_query_failed", {
      query: label,
      code: (error as { code?: string })?.code,
      error: firstLine ?? raw.trim() ?? "unknown",
    });
    return fallback;
  }
}
