export type SessionRole = "CUSTOMER" | "ADMIN";

export type SessionUser = {
  id: string;
  email: string;
  role: SessionRole;
};

type SessionPayload = SessionUser & {
  iat: number;
  exp: number;
};

export const SESSION_COOKIE_NAME = "mojasame_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const REMEMBERED_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const textEncoder = new TextEncoder();

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "development-only-auth-secret-change-me";
  }

  throw new Error("AUTH_SECRET is required in production");
}

function base64UrlEncode(input: string | Uint8Array) {
  const buffer =
    typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);
  return buffer.toString("base64url");
}

function base64UrlDecodeToBytes(input: string) {
  return new Uint8Array(Buffer.from(input, "base64url"));
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(payload: string) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getSigningKey(),
    textEncoder.encode(payload),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

async function verifySignature(payload: string, signature: string) {
  try {
    return crypto.subtle.verify(
      "HMAC",
      await getSigningKey(),
      base64UrlDecodeToBytes(signature),
      textEncoder.encode(payload),
    );
  } catch {
    return false;
  }
}

function safeParsePayload(payload: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(payload) as Partial<SessionPayload>;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.email !== "string" ||
      (parsed.role !== "CUSTOMER" && parsed.role !== "ADMIN") ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    if (parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSessionToken(
  user: SessionUser,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS,
) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    ...user,
    iat: now,
    exp: now + maxAgeSeconds,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | null | undefined) {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  if (!(await verifySignature(encodedPayload, signature))) return null;

  return safeParsePayload(base64UrlDecode(encodedPayload));
}
