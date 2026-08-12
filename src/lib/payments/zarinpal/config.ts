import { getSiteUrl } from "@/lib/seo/metadata";

export type ZarinpalConfig = {
  merchantId: string;
  sandbox: boolean;
  callbackUrl: string;
  apiBaseUrl: string;
  gatewayBaseUrl: string;
};

export function getZarinpalConfig(): ZarinpalConfig | null {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID?.trim();
  if (!merchantId) return null;

  /**
   * sandbox فقط با انتخاب صریح.
   *
   * قبلاً در حالت توسعه به‌طور پیش‌فرض روشن بود، ولی `sandbox.zarinpal.com`
   * دیگر توسط زرین‌پال سرویس داده نمی‌شود: درخواست تا سقف timeout معطل می‌ماند
   * و بعد `/pg/StartPay/...` همان دامنه ۴۰۴ می‌دهد. یعنی پیش‌فرضِ «امن» عملاً
   * پرداخت را در توسعه همیشه خراب می‌کرد.
   */
  const sandbox = process.env.ZARINPAL_SANDBOX === "true";

  const callbackFromEnv = process.env.PAYMENT_CALLBACK_URL?.trim();
  const callbackUrl =
    callbackFromEnv && callbackFromEnv.startsWith("http")
      ? callbackFromEnv
      : new URL("/api/payments/zarinpal/callback", getSiteUrl()).toString();

  // دامنه‌ی فعلی REST و StartPay مطابق SDK رسمی زرین‌پال.
  const apiBaseUrl = sandbox
    ? "https://sandbox.zarinpal.com"
    : "https://payment.zarinpal.com";

  /**
   * دامنه‌ی اختصاصی درگاه (مثلاً pay.mojasamesaidi.ir).
   * زرین‌پال به پذیرنده اجازه می‌دهد یک ساب‌دامین را CNAME کند تا صفحه‌ی پرداخت
   * زیر دامنه‌ی خودِ فروشگاه دیده شود، نه zarinpal.com. فقط در حالت واقعی (نه
   * sandbox) استفاده می‌شود؛ اگر ست نشود، آدرس پیش‌فرض زرین‌پال به‌کار می‌رود.
   */
  const customDomain = process.env.ZARINPAL_GATEWAY_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const gatewayBaseUrl = sandbox
    ? "https://sandbox.zarinpal.com"
    : customDomain
      ? `https://${customDomain}`
      : "https://payment.zarinpal.com";

  return {
    merchantId,
    sandbox,
    callbackUrl,
    apiBaseUrl,
    gatewayBaseUrl,
  };
}

export function isZarinpalEnabled() {
  return Boolean(getZarinpalConfig());
}
