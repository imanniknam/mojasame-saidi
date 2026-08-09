import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BrandGlyph } from "@/components/layout/brand-mark";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="ds-container flex min-h-dvh flex-col items-center justify-center py-16 text-center">
      <BrandGlyph className="h-12 w-auto text-primary/50" />

      <p data-numeric className="ds-overline mt-8">
        Error 404
      </p>

      <h1 className="ds-title mt-2 text-foreground">این صفحه پیدا نشد</h1>

      <p className="ds-prose mt-3 text-center">
        ممکن است اثری که دنبالش بودید حذف یا جابه‌جا شده باشد. می‌توانید از مجموعه‌ها
        شروع کنید.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="luxury" size="touch" className="px-6" asChild>
          <Link href="/products">مشاهده همه آثار</Link>
        </Button>
        <Button variant="outline" size="touch" className="px-6" asChild>
          <Link href="/">صفحه اصلی</Link>
        </Button>
      </div>
    </main>
  );
}
