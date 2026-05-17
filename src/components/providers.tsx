"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { NavUser } from "@/components/layout/site-header";
import { NavigationProvider } from "@/components/layout/navigation-context";
import { SessionProvider } from "@/components/session/session-provider";

const SearchNavDialog = dynamic(
  () =>
    import("@/components/layout/search-nav-dialog").then(
      (mod) => mod.SearchNavDialog,
    ),
  { ssr: false },
);

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false },
);

export function Providers({
  children,
  initialSessionUser = null,
}: {
  children: ReactNode;
  initialSessionUser?: NavUser | null;
}) {
  return (
    <SessionProvider initialUser={initialSessionUser}>
      <NavigationProvider>
        {children}
        <SearchNavDialog />
        <Toaster closeButton />
      </NavigationProvider>
    </SessionProvider>
  );
}
