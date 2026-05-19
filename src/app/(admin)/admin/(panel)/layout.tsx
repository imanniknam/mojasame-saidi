import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { getAdminDisplayName } from "@/lib/admin/queries";
import { getActiveSessionUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getActiveSessionUser();
  if (user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const displayName = await getAdminDisplayName(user.id);

  return (
    <AdminShell userLabel={displayName ?? "مدیر"} userEmail={user.email}>
      {children}
    </AdminShell>
  );
}
