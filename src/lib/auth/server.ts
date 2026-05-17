import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, getSessionUserFromRequest, type SessionUser } from "./session";

export type AuthenticatedUser = SessionUser & {
  customerId?: string;
  adminId?: string;
};

async function loadActiveUser(session: SessionUser | null): Promise<AuthenticatedUser | null> {
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      isActive: true,
      admin: { select: { id: true } },
      customer: { select: { id: true } },
    },
  });

  if (!user?.isActive || user.email !== session.email) {
    return null;
  }

  if (session.role === "ADMIN" && user.admin) {
    return { id: user.id, email: user.email, role: "ADMIN", adminId: user.admin.id };
  }

  if (session.role === "CUSTOMER" && user.customer) {
    return {
      id: user.id,
      email: user.email,
      role: "CUSTOMER",
      customerId: user.customer.id,
    };
  }

  return null;
}

export async function getActiveSessionUser() {
  return loadActiveUser(await getSessionUser());
}

export async function getActiveSessionUserFromRequest(request: Request | NextRequest) {
  return loadActiveUser(await getSessionUserFromRequest(request));
}

export async function requireActiveAdmin(request: Request | NextRequest) {
  const user = await getActiveSessionUserFromRequest(request);
  if (user?.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireActiveCustomer(request: Request | NextRequest) {
  const user = await getActiveSessionUserFromRequest(request);
  if (user?.role !== "CUSTOMER") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
