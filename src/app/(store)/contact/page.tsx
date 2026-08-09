import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ContactForm } from "@/components/store/contact-form";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCachedStorefrontSettings } from "@/lib/storefront/cached";
import { safeQuery } from "@/lib/storefront/safe";

export const metadata: Metadata = buildPageMetadata({
  title: "تماس با ما",
  description:
    "برای سفارش اختصاصی، مشاوره‌ی چیدمان یا هر پرسشی درباره‌ی آثار مجسمه سعیدی با ما در تماس باشید.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await safeQuery("contactSettings", getCachedStorefrontSettings, null);

  // فقط راه‌های ارتباطیِ واقعاً ثبت‌شده نمایش داده می‌شوند — شماره‌ی ساختگی نمی‌گذاریم.
  const channels = [
    settings?.supportPhone
      ? { icon: Phone, labelFa: "تلفن پشتیبانی", value: settings.supportPhone, href: null }
      : null,
    settings?.supportEmail
      ? {
          icon: Mail,
          labelFa: "ایمیل",
          value: settings.supportEmail,
          href: `mailto:${settings.supportEmail}`,
        }
      : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <main className="mb-nav">
      <div className="ds-container pt-6">
        <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "تماس با ما" }]} />
      </div>

      <div className="ds-container py-8 lg:py-12">
        <p className="ds-overline">Contact</p>
        <h1 className="ds-title mt-2 text-foreground">تماس با ما</h1>
        <p className="ds-prose mt-3">
          برای سفارش اختصاصی، مشاوره‌ی چیدمان یا هر پرسشی درباره‌ی آثار، پیام بگذارید.
          در سریع‌ترین زمان ممکن پاسخ می‌دهیم.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
          <ContactForm />

          <aside className="flex flex-col gap-6">
            {channels.length > 0 ? (
              <div className="border border-border bg-card p-6">
                <h2 className="ds-heading text-foreground">راه‌های ارتباطی</h2>
                <ul className="mt-5 flex flex-col gap-5">
                  {channels.map((channel) => (
                    <li key={channel.labelFa} className="flex items-start gap-3">
                      <channel.icon
                        className="mt-0.5 size-5 shrink-0 stroke-[1.5] text-primary"
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{channel.labelFa}</p>
                        {channel.href ? (
                          <a
                            href={channel.href}
                            dir="ltr"
                            className="mt-1 block truncate text-sm font-medium text-foreground transition-colors duration-fast hover:text-primary"
                          >
                            {channel.value}
                          </a>
                        ) : (
                          <p
                            data-numeric
                            className="mt-1 text-sm font-medium text-foreground"
                          >
                            {channel.value}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="border border-border bg-card p-6">
              <MessageCircle className="size-5 stroke-[1.5] text-primary" aria-hidden />
              <h2 className="ds-heading mt-3 text-foreground">سفارش اختصاصی</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                اگر اثری با ابعاد، رنگ یا طرح خاص می‌خواهید، در پیام‌تان توضیح دهید تا
                امکان‌سنجی و قیمت را برایتان بفرستیم.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
