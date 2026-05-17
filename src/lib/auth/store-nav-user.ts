import type { NavUser } from "@/components/layout/site-header";
import { getActiveSessionUser } from "@/lib/auth/server";

/** User info for storefront header (customer or admin browsing the shop). */
export async function getStoreNavUser(): Promise<NavUser | null> {
  const session = await getActiveSessionUser();
  if (!session) return null;

  return {
    name: session.displayName,
    email: session.email,
    role: session.role,
  };
}
