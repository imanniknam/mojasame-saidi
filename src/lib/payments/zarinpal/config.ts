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

  const sandbox =
    process.env.ZARINPAL_SANDBOX === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.ZARINPAL_SANDBOX !== "false");

  const callbackFromEnv = process.env.PAYMENT_CALLBACK_URL?.trim();
  const callbackUrl =
    callbackFromEnv && callbackFromEnv.startsWith("http")
      ? callbackFromEnv
      : new URL("/api/payments/zarinpal/callback", getSiteUrl()).toString();

  const apiBaseUrl = sandbox ? "https://sandbox.zarinpal.com" : "https://api.zarinpal.com";
  const gatewayBaseUrl = sandbox ? "https://sandbox.zarinpal.com" : "https://www.zarinpal.com";

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
