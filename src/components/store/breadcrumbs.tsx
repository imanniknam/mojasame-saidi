import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/metadata";

export type Crumb = {
  label: string;
  /** آخرین مورد مسیر لینک ندارد */
  href?: string;
};

/**
 * مسیر راهنما + داده‌ی ساخت‌یافته‌ی BreadcrumbList.
 * فلش به چپ است چون در RTL جهت «جلو رفتن در مسیر» همان چپ است.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="مسیر صفحه">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                {item.href && !last ? (
                  <Link
                    href={item.href}
                    className="transition-colors duration-fast hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className="text-foreground">
                    {item.label}
                  </span>
                )}
                {!last ? (
                  <ChevronLeft className="size-3.5 shrink-0 opacity-50" aria-hidden />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
