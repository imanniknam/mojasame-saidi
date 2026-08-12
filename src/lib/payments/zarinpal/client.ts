import { getZarinpalConfig } from "@/lib/payments/zarinpal/config";

type ZarinpalApiEnvelope<T> = {
  data: T;
  errors: { code: number; message: string; validations?: unknown[] }[];
};

type ZarinpalDataBase = {
  code: number;
  message: string;
};

type RequestPaymentData = ZarinpalDataBase & {
  authority: string;
  fee_type?: string;
  fee?: number;
};

type VerifyPaymentData = ZarinpalDataBase & {
  ref_id: number;
  card_pan?: string;
  card_hash?: string;
  fee_type?: string;
  fee?: number;
};

const ZARINPAL_REQUEST_TIMEOUT_MS = 12_000;

async function fetchZarinpal(url: string, init: RequestInit) {
  try {
    return await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(ZARINPAL_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new Error("ZARINPAL_TIMEOUT");
    }
    throw error;
  }
}

async function postZarinpal<T extends ZarinpalDataBase>(
  path: string,
  body: Record<string, unknown>,
) {
  const config = getZarinpalConfig();
  if (!config) {
    throw new Error("ZARINPAL_NOT_CONFIGURED");
  }

  const response = await fetchZarinpal(`${config.apiBaseUrl}/pg/v4/payment/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await response.json()) as ZarinpalApiEnvelope<T>;

  if (!response.ok || json.errors?.length) {
    const message = json.errors?.[0]?.message ?? `Zarinpal HTTP ${response.status}`;
    throw new Error(message);
  }

  if (json.data.code !== 100) {
    throw new Error(json.data.message || `Zarinpal code ${json.data.code}`);
  }

  return { config, data: json.data, raw: json };
}

export async function zarinpalRequestPayment(input: {
  amountMinor: number;
  description: string;
  callbackUrl?: string;
  mobile?: string;
  email?: string;
  orderId?: string;
}) {
  const config = getZarinpalConfig();
  if (!config) throw new Error("ZARINPAL_NOT_CONFIGURED");

  const metadata: Record<string, string> = {};
  if (input.mobile) metadata.mobile = input.mobile;
  if (input.email) metadata.email = input.email;
  if (input.orderId) metadata.order_id = input.orderId;

  const { data, raw } = await postZarinpal<RequestPaymentData>("request.json", {
    merchant_id: config.merchantId,
    amount: input.amountMinor,
    currency: "IRT",
    description: input.description,
    callback_url: input.callbackUrl ?? config.callbackUrl,
    ...(Object.keys(metadata).length ? { metadata } : {}),
  });

  const gatewayUrl = `${config.gatewayBaseUrl}/pg/StartPay/${data.authority}`;

  return {
    authority: data.authority,
    gatewayUrl,
    raw,
  };
}

export async function zarinpalVerifyPayment(input: {
  authority: string;
  amountMinor: number;
}) {
  const config = getZarinpalConfig();
  if (!config) throw new Error("ZARINPAL_NOT_CONFIGURED");

  const response = await fetchZarinpal(`${config.apiBaseUrl}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      merchant_id: config.merchantId,
      amount: input.amountMinor,
      authority: input.authority,
    }),
  });

  const json = (await response.json()) as ZarinpalApiEnvelope<VerifyPaymentData | never[]>;

  /**
   * پاسخ خطای زرین‌پال «شکستِ تأیید» است، نه خرابیِ سرویس.
   *
   * قبلاً اینجا throw می‌شد و صدازننده هم آن را مهار نمی‌کرد، پس رکورد
   * Payment برای همیشه در وضعیت PENDING می‌ماند و هیچ‌وقت FAILED نمی‌شد —
   * سفارش عملاً بلاتکلیف رها می‌شد. حالا نتیجه‌ی ناموفق برمی‌گردانیم تا
   * صدازننده وضعیت را درست ثبت کند. فقط پاسخ غیرقابل‌تفسیر (HTTP خراب بدون
   * بدنه‌ی خطا) استثنا محسوب می‌شود.
   */
  const failure = json.errors?.[0];
  if (failure) {
    return {
      success: false as const,
      code: failure.code,
      message: failure.message,
      refId: null,
      cardPanMasked: null,
      raw: json,
    };
  }

  const data = Array.isArray(json.data) ? null : json.data;
  if (!data) {
    if (!response.ok) throw new Error(`Zarinpal verify HTTP ${response.status}`);
    throw new Error("Zarinpal verify returned no data");
  }

  // ۱۰۰ = تأیید شد، ۱۰۱ = قبلاً تأیید شده بود (بازگشت دوباره‌ی کاربر)
  const success = data.code === 100 || data.code === 101;

  return {
    success,
    code: data.code,
    message: data.message,
    refId: data.ref_id,
    cardPanMasked: data.card_pan ?? null,
    raw: json,
  };
}
