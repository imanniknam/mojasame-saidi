import { NextResponse } from "next/server";
import { logger } from "@/lib/server/logger";

type ApiErrorOptions = {
  status?: number;
  code?: string;
  publicMessage?: string;
  context?: Record<string, unknown>;
};

export function jsonNoStore<T>(body: T, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export function apiErrorResponse(error: unknown, options: ApiErrorOptions = {}) {
  const isForbidden = error instanceof Error && error.message === "FORBIDDEN";
  const isValidationError =
    !!error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues);
  const status = options.status ?? (isForbidden ? 403 : isValidationError ? 422 : 500);
  const code =
    options.code ??
    (isForbidden ? "FORBIDDEN" : isValidationError ? "VALIDATION_ERROR" : "INTERNAL_ERROR");
  const publicMessage =
    options.publicMessage ??
    (isForbidden
      ? "دسترسی شما به این بخش مجاز نیست."
      : isValidationError
        ? "اطلاعات واردشده معتبر نیست."
        : "خطای غیرمنتظره رخ داد.");

  logger.error("api_error", {
    code,
    status,
    error: error instanceof Error ? error.message : String(error),
    ...options.context,
  });

  return jsonNoStore(
    {
      ok: false,
      error: {
        code,
        message: publicMessage,
      },
    },
    { status },
  );
}
