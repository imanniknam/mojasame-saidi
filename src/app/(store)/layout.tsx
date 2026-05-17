import { StoreShell } from "@/components/layout/store-shell";

export default function StoreGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreShell>{children}</StoreShell>;
}
