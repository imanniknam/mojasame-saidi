import type { NavUser } from "@/components/layout/site-header";

type MePayload = {
  ok: boolean;
  user: {
    displayName: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
  } | null;
};

export async function fetchSessionUser(): Promise<NavUser | null> {
  try {
    const response = await fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "include",
    });
    const data = (await response.json()) as MePayload;
    if (!data.ok || !data.user) return null;
    return {
      name: data.user.displayName,
      email: data.user.email,
      role: data.user.role,
    };
  } catch {
    return null;
  }
}
