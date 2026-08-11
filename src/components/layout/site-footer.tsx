import Link from "next/link";
import { Instagram, Send } from "lucide-react";
import { EnamadSeal } from "@/components/layout/enamad-seal";
import { BrandMark } from "@/components/layout/brand-mark";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { SITE_NAME_FA } from "@/lib/constants/site";

const COLUMNS = [
  {
    titleFa: "خدمات مشتریان",
    links: [
      { href: "/contact", label: "پرسش‌های متداول" },
      { href: "/contact", label: "شرایط و قوانین" },
      { href: "/contact", label: "حریم خصوصی" },
      { href: "/contact", label: "رویه بازگشت کالا" },
    ],
  },
  {
    titleFa: "راهنمای خرید",
    links: [
      { href: "/products", label: "نحوه ثبت سفارش" },
      { href: "/checkout", label: "روش‌های پرداخت" },
      { href: "/contact", label: "ارسال و تحویل" },
      { href: "/orders/track", label: "پیگیری سفارش" },
    ],
  },
  {
    titleFa: "دسترسی سریع",
    links: [
      { href: "/products", label: "محصولات" },
      { href: "/categories", label: "مجموعه‌ها" },
      { href: "/about", label: "درباره ما" },
      { href: "/contact", label: "تماس با ما" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="ds-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:py-14">
        {/* برند + شبکه‌های اجتماعی */}
        <div className="lg:col-span-1">
          <BrandMark orientation="horizontal" />
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="اینستاگرام مجسمه سعیدی"
              className="ds-touch-target inline-flex items-center justify-center border border-border text-muted-foreground transition-colors duration-fast hover:border-primary/50 hover:text-primary"
            >
              <Instagram className="size-[1.1rem] stroke-[1.6]" aria-hidden />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تلگرام مجسمه سعیدی"
              className="ds-touch-target inline-flex items-center justify-center border border-border text-muted-foreground transition-colors duration-fast hover:border-primary/50 hover:text-primary"
            >
              <Send className="size-[1.1rem] stroke-[1.6]" aria-hidden />
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.titleFa} aria-label={col.titleFa}>
            <h2 className="mb-4 text-sm font-bold text-foreground">{col.titleFa}</h2>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={`${col.titleFa}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-muted-foreground transition-colors duration-fast hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* خبرنامه */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h2 className="mb-4 text-sm font-bold text-foreground">خبرنامه</h2>
          <p className="mb-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
            جدیدترین محصولات و تخفیف‌ها را از دست ندهید.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="ds-container flex flex-col items-center justify-between gap-5 py-6 pb-[calc(1.5rem+4.25rem+env(safe-area-inset-bottom))] sm:flex-row lg:pb-6">
          <p className="text-center text-[0.6875rem] text-muted-foreground sm:text-start">
            تمامی حقوق این سایت متعلق به {SITE_NAME_FA} می‌باشد. © {year}
          </p>
          <div className="shrink-0">
            <EnamadSeal />
          </div>
        </div>
      </div>
    </footer>
  );
}
