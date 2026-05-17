/** واحد پول نمایش — در UI با فاصله‌گذار فارسی ترکیب شود */
export const CURRENCY_LABEL_FA = "تومان";

/**
 * فرمت قیمت فارسی با جداکننده هزارگان.
 * ورودی: مبلغ به «خرده‌ی واحد پول» مطابق قرارداد دیتابیس (مثلاً تومان).
 */
export function formatPriceFa(amountMinor: number): string {
  if (!Number.isFinite(amountMinor)) {
    return "—";
  }
  const rounded = Math.round(amountMinor);
  const formatted = new Intl.NumberFormat("fa-IR").format(rounded);
  return `${formatted} ${CURRENCY_LABEL_FA}`;
}
