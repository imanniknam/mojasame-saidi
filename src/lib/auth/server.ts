import type { NextRequest } from "next/server";
import { formatUserDisplayName } from "@/lib/auth/display-name";
import { prisma } from "@/lib/prisma";
import { getSessionUser, getSessionUserFromRequest, type SessionUser } from "./session";

export type AuthenticatedUser = SessionUser & {
  displayName: string;
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
      role: true,
      isActive: true,
      admin: { select: { id: true, displayName: true } },
      customer: {
        select: { id: true, displayFa: true, firstName: true, lastName: true },
      },
    },
  });

  if (!user?.isActive || user.email !== session.email) {
    return null;
  }

  const displayName = formatUserDisplayName({
    email: user.email,
    customer: user.customer,
    admin: user.admin,
  });

  if (session.role === "ADMIN" && user.role === "ADMIN" && user.admin) {
    return {
      id: user.id,
      email: user.email,
      role: "ADMIN",
      displayName,
      adminId: user.admin.id,
    };
  }

  if (session.role === "CUSTOMER" && user.role === "CUSTOMER" && user.customer) {
    return {
      id: user.id,
      email: user.email,
      role: "CUSTOMER",
      displayName,
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

/** برای Server Actions و Server Components بدون Request */
export async function requireActiveAdminSession() {
  const user = await getActiveSessionUser();
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
