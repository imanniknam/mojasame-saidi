/**
 * نرمال‌سازی متن فارسی برای جستجو.
 *
 * مشکل واقعی: کاربر ایرانی ممکن است با صفحه‌کلید عربی تایپ کند («ي» و «ك» عربی
 * به‌جای «ی» و «ک» فارسی)، نیم‌فاصله بگذارد یا نگذارد، اعداد را فارسی یا عربی
 * بنویسد، و اعراب بگذارد. بدون نرمال‌سازی، «كتاب» هرگز «کتاب» را پیدا نمی‌کند.
 *
 * این منطق عمداً وابسته به دیتابیس نیست تا در فاز Laravel عیناً قابل انتقال باشد.
 */

const CHAR_MAP: Record<string, string> = {
  // کاف و یای عربی → فارسی
  "ي": "ی", // ي → ی
  "ى": "ی", // ى → ی
  "ك": "ک", // ك → ک
  // شکل‌های الف
  "أ": "ا", // أ → ا
  "إ": "ا", // إ → ا
  "آ": "ا", // آ → ا
  "ٱ": "ا", // ٱ → ا
  // ه و ت گرد
  "ة": "ه", // ة → ه
  "ۀ": "ه", // ۀ → ه
  // واو با همزه
  "ؤ": "و", // ؤ → و
  "ئ": "ی", // ئ → ی
};

/** اعراب، تشدید، سکون و کشیده — در جستجو بی‌معنی‌اند */
const STRIP_RE = /[ً-ْٰـ‌‏‎]/g;

/** ارقام عربی‌هندی و فارسی → لاتین */
function foldDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}

export function normalizeFa(input: string | null | undefined): string {
  if (!input) return "";

  let out = input.normalize("NFC");
  out = out.replace(/[يىكأإآٱةۀؤئ]/g, (c) => CHAR_MAP[c] ?? c);
  out = out.replace(STRIP_RE, "");
  out = foldDigits(out);
  out = out.toLowerCase();
  out = out.replace(/\s+/g, " ").trim();

  return out;
}

/** واژه‌های معنادار پرس‌وجو — کلمات یک‌حرفی و حروف ربط حذف می‌شوند */
const STOP_WORDS = new Set(["و", "با", "از", "در", "به", "برای", "یک", "the", "a"]);

export function tokenizeFa(input: string): string[] {
  return normalizeFa(input)
    .split(/[\s،,،.؛;:!؟?()«»"'/\\-]+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}
