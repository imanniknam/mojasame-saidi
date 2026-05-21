import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/validations/auth";

const TOKEN_BYTES = 32;
const DEFAULT_TTL_MINUTES = 60;
const MIN_REQUEST_INTERVAL_MS = 2 * 60 * 1000;

function tokenTtlMinutes() {
  const raw = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? DEFAULT_TTL_MINUTES);
  if (!Number.isFinite(raw) || raw < 15 || raw > 24 * 60) return DEFAULT_TTL_MINUTES;
  return Math.floor(raw);
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetTokenValue() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export async function requestPasswordReset(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, isActive: true },
  });

  if (!user?.isActive) {
    return { sent: false as const, reason: "generic" as const };
  }

  const recent = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      createdAt: { gte: new Date(Date.now() - MIN_REQUEST_INTERVAL_MS) },
    },
    select: { id: true },
  });

  if (recent) {
    return { sent: false as const, reason: "rate_limited" as const };
  }

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = createPasswordResetTokenValue();
  const expiresAt = new Date(Date.now() + tokenTtlMinutes() * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashResetToken(token),
      expiresAt,
    },
  });

  return {
    sent: true as const,
    email: user.email,
    token,
    expiresAt,
  };
}

export async function validatePasswordResetToken(token: string) {
  const tokenHash = hashResetToken(token.trim());
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { expiresAt: true, usedAt: true },
  });

  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { valid: false as const };
  }

  return { valid: true as const };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const tokenHash = hashResetToken(token.trim());
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: { select: { id: true, isActive: true } },
    },
  });

  if (!row || row.usedAt || row.expiresAt < new Date() || !row.user.isActive) {
    return { ok: false as const, code: "INVALID_TOKEN" as const };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: row.userId, usedAt: null, id: { not: row.id } },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true as const };
}
