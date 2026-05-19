import { StoreShell } from "@/components/layout/store-shell";

/** Store pages read from Postgres — skip static generation at build (no DATABASE_URL needed then). */
export const dynamic = "force-dynamic";

export default function StoreGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreShell>{children}</StoreShell>;
}
