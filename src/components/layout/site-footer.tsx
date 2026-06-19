import Link from "next/link";
import { EnamadSeal } from "@/components/layout/enamad-seal";
import { SITE_DOMAIN_LABEL, SITE_NAME_FA } from "@/lib/constants/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30 px-4 py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-start">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{SITE_NAME_FA}</p>
          <p className="text-xs text-muted-foreground">{SITE_DOMAIN_LABEL}</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link href="/about" className="transition-colors hover:text-foreground">
            درباره ما
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">
            تماس با ما
          </Link>
        </nav>

        <div className="shrink-0">
          <EnamadSeal />
        </div>
      </div>
    </footer>
  );
}
