import type { NavUser } from "@/components/layout/site-header";
import { getActiveSessionUser } from "@/lib/auth/server";
import { logger } from "@/lib/server/logger";

/**
 * اطلاعات کاربر برای هدر فروشگاه.
 *
 * این تابع در ریشه‌ی layout صدا زده می‌شود، پس اگر پرتاب کند **کل سایت** می‌افتد —
 * حتی صفحاتی که خودشان در برابر خطا مقاوم شده‌اند. یک قطعی لحظه‌ای دیتابیس نباید
 * فروشگاه را از دسترس خارج کند، بنابراین اینجا تنزل می‌دهیم و هدر را در حالت
 * «وارد نشده» رندر می‌کنیم.
 *
 * دامنه‌ی این تنزل عمداً محدود است: فقط نمایش هدر. مسیرهای کنترل دسترسی
 * (`requireActiveAdmin` و `requireActiveCustomer`) همچنان پرتاب می‌کنند و هرگز
 * نباید این‌طور خاموش شوند — آنجا خطای بلعیده‌شده یعنی حفره‌ی امنیتی.
 */
export async function getStoreNavUser(): Promise<NavUser | null> {
  try {
    const session = await getActiveSessionUser();
    if (!session) return null;

    return {
      name: session.displayName,
      email: session.email ?? undefined,
      role: session.role,
    };
  } catch (error) {
    logger.error("store_nav_user_failed", {
      error: error instanceof Error ? error.message.split("\n").find((l) => l.trim()) : String(error),
    });
    return null;
  }
}
