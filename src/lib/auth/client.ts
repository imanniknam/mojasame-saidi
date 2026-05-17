type AuthApiResult<T> =
  | ({ ok: true } & T)
  | { ok: false; error?: { message?: string; code?: string } };

export async function readAuthResponse<T>(response: Response): Promise<AuthApiResult<T>> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as AuthApiResult<T>;
  }

  return {
    ok: false,
    error: {
      code: "NON_JSON_RESPONSE",
      message:
        response.status >= 500
          ? "سرور ورود با خطا روبه‌رو شد. تنظیمات محیط و پایگاه داده را بررسی کنید."
          : "پاسخ سرور قابل خواندن نیست.",
    },
  };
}
