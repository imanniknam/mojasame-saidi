import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const AUTH_COOKIE_NAMES = [
  SESSION_COOKIE_NAME,
  "session",
  "auth_session",
  "customer_session",
  "admin_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
] as const;

function safeRedirectUrl(request: NextRequest, formNext: string | null) {
  const requestedNext = formNext ?? request.nextUrl.searchParams.get("next");

  if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
    return new URL(requestedNext, request.nextUrl.origin);
  }

  return new URL("/login?loggedOut=1", request.nextUrl.origin);
}

function logout(request: NextRequest, formNext: string | null) {
  // ۳۰۳ و نه ۳۰۷: مقصد یک صفحه است و باید با GET باز شود، وگرنه مرورگر همان
  // POST را به /login می‌فرستد و ۴۰۵ می‌گیرد.
  const response = NextResponse.redirect(safeRedirectUrl(request, formNext), 303);
  clearSessionCookie(response);

  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.set(name, "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
  }

  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

/**
 * فقط POST — عمداً GET ندارد.
 *
 * وقتی خروج یک لینکِ GET بود، `<Link href="/logout">` داخل منوی کاربر به‌محض
 * دیده‌شدن prefetch می‌شد؛ prefetch یک درخواست واقعی است، پس همین route اجرا
 * می‌شد و کوکی سشن را پاک می‌کرد. نتیجه این بود که کاربر فقط با **باز کردن**
 * منو از حساب خارج می‌شد و بعد کلیک روی «حساب کاربری» یا «سفارش‌های من» به
 * صفحه‌ی ورود می‌خورد. عملی که وضعیت را تغییر می‌دهد نباید GET باشد.
 */
export function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("form")) {
    return request.formData().then((form) => {
      const next = form.get("next");
      return logout(request, typeof next === "string" ? next : null);
    });
  }
  return logout(request, null);
}
