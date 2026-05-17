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

function safeRedirectUrl(request: NextRequest) {
  const requestedNext = request.nextUrl.searchParams.get("next");

  if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
    return new URL(requestedNext, request.nextUrl.origin);
  }

  return new URL("/login?loggedOut=1", request.nextUrl.origin);
}

function logout(request: NextRequest) {
  const response = NextResponse.redirect(safeRedirectUrl(request));
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

export function GET(request: NextRequest) {
  return logout(request);
}

export function POST(request: NextRequest) {
  return logout(request);
}
