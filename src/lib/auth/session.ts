import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionToken,
  REMEMBERED_SESSION_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
  type SessionUser,
} from "@/lib/auth/session-token";

export {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  REMEMBERED_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
};
export type { SessionRole, SessionUser } from "@/lib/auth/session-token";

function readRequestCookie(request: Request | NextRequest, name: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === name) return rawValue.join("=");
  }

  return undefined;
}

export async function getSessionUserFromRequest(request: Request | NextRequest) {
  return verifySessionToken(readRequestCookie(request, SESSION_COOKIE_NAME));
}

export async function getSessionUser() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function setSessionCookie(
  response: NextResponse,
  user: SessionUser,
  options: { remember?: boolean } = {},
) {
  const maxAge = options.remember
    ? REMEMBERED_SESSION_MAX_AGE_SECONDS
    : SESSION_MAX_AGE_SECONDS;
  const token = await createSessionToken(user, maxAge);
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}
