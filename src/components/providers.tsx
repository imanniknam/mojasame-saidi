"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { NavigationProvider } from "@/components/layout/navigation-context";

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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      {children}
      <SearchNavDialog />
      <Toaster closeButton />
    </NavigationProvider>
  );
}
