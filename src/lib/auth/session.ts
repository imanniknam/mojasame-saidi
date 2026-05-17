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
export type { SessionUser };

export async function getSessionUserFromRequest(_request?: Request | NextRequest) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
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
