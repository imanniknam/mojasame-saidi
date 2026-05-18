import { getZarinpalConfig } from "@/lib/payments/zarinpal/config";

type ZarinpalApiEnvelope<T> = {
  data: T;
  errors: { code: number; message: string; validations?: unknown[] }[];
};

type RequestPaymentData = {
  code: number;
  message: string;
  authority: string;
  fee_type?: string;
  fee?: number;
};

type VerifyPaymentData = {
  code: number;
  message: string;
  ref_id: number;
  card_pan?: string;
  card_hash?: string;
  fee_type?: string;
  fee?: number;
};

async function postZarinpal<T>(path: string, body: Record<string, unknown>) {
  const config = getZarinpalConfig();
  if (!config) {
    throw new Error("ZARINPAL_NOT_CONFIGURED");
  }

  const response = await fetch(`${config.apiBaseUrl}/pg/v4/payment/${path}`, {
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

  const response = await fetch(`${config.apiBaseUrl}/pg/v4/payment/verify.json`, {
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

  const json = (await response.json()) as ZarinpalApiEnvelope<VerifyPaymentData>;

  if (!response.ok || json.errors?.length) {
    const message = json.errors?.[0]?.message ?? `Zarinpal verify HTTP ${response.status}`;
    throw new Error(message);
  }

  const success = json.data.code === 100 || json.data.code === 101;

  return {
    success,
    code: json.data.code,
    message: json.data.message,
    refId: json.data.ref_id,
    cardPanMasked: json.data.card_pan ?? null,
    raw: json,
  };
}
