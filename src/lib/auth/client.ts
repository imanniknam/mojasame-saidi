type AuthApiResult<T> =
  | ({ ok: true } & T)
  | { ok: false; error?: { message?: string; code?: string } };

export async function readAuthResponse<T>(response: Response): Promise<AuthApiResult<T>> {
  const contentType = response.headers.get("content-type") ?? "";
  let body: unknown = null;

  try {
    const text = await response.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    if (contentType.includes("application/json")) {
      return {
        ok: false,
        error: {
          code: "INVALID_JSON",
          message: "پاسخ سرور قابل خواندن نیست.",
        },
      };
    }
  }

  if (body && typeof body === "object" && "ok" in body) {
    return body as AuthApiResult<T>;
  }

  return {
    ok: false,
    error: {
      code: "NON_JSON_RESPONSE",
      message:
        response.status >= 500
          ? "خطای سرور (پاسخ HTML). PostgreSQL را روشن کنید، در پوشه mojasame-saidi دستور npm run db:setup را اجرا کنید، سپس سرور dev را ری‌استارت کنید. برای تشخیص: /api/health/db"
          : `درخواست ناموفق بود (کد ${response.status}).`,
    },
  };
}
