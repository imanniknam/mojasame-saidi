import { prisma } from "@/lib/prisma";
import { normalizeEmail, normalizeDigits } from "@/lib/validations/auth";

export function normalizeIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return { email: normalizeEmail(trimmed), phone: null as string | null };
  }
  const phone = normalizeDigits(trimmed).replace(/[^\d]/g, "");
  return { email: null as string | null, phone: phone || null };
}

export async function findUserByIdentifier(identifier: string) {
  const { email, phone } = normalizeIdentifier(identifier);
  if (!email && !phone) return null;

  return prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    },
    include: {
      admin: true,
      customer: true,
    },
  });
}
