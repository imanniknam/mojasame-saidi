import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ProductMedia } from "@/components/store/product-media";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "درباره ما",
  description:
    "مجسمه سعیدی؛ آثار دست‌ساز دکوراتیو با تمرکز بر جزئیات، کیفیت ساخت و احترام به هنر کلاسیک و مدرن.",
  path: "/about",
});

/**
 * متن‌ها از محتوای خودِ برند گرفته شده‌اند.
 * هرچه واقعیت‌محور است (سال تأسیس، نشانی کارگاه، تعداد آثار) عمداً نیامده تا
 * چیزی از خودمان نسازیم؛ به‌محض دریافت از مالک فروشگاه اضافه می‌شود.
 */
const PILLARS = [
  {
    titleFa: "دقت در طراحی",
    bodyFa:
      "هر اثر پیش از ساخت، در طراحی بازبینی می‌شود تا تناسب، حجم و جزئیات در فضای واقعی درست بنشیند.",
  },
  {
    titleFa: "کیفیت در ساخت",
    bodyFa:
      "انتخاب متریال و پرداخت نهایی تعیین‌کننده‌ی ماندگاری اثر است؛ روی همین دو بیشترین وقت گذاشته می‌شود.",
  },
  {
    titleFa: "احترام به هنر کلاسیک و مدرن",
    bodyFa:
      "مجموعه بین فرم‌های کلاسیک و خطوط مدرن حرکت می‌کند تا با چیدمان‌های متفاوت هماهنگ بماند.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="mb-nav">
      <div className="ds-container pt-6">
        <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "درباره ما" }]} />
      </div>

      <div className="ds-container py-8 lg:py-12">
        <p className="ds-overline">About</p>
        <h1 className="ds-title mt-2 text-foreground">داستان مجسمه سعیدی</h1>

        <div className="mt-6 max-w-prose">
          <p className="ds-body">
            ما در مجسمه سعیدی، با عشق به هنر و جزئیات، آثاری خلق می‌کنیم که فراتر از
            دکوراسیون به فضاها شخصیت و اصالت می‌بخشند.
          </p>
          <p className="ds-body mt-4">
            هر مجسمه، نتیجه‌ی دقت در طراحی، کیفیت در ساخت و احترام به هنر کلاسیک و مدرن
            است. هدف‌مان این است که هر اثر، سال‌ها بعد هم در خانه‌ی شما تازه بماند.
          </p>
        </div>
      </div>

      <section className="border-y border-border bg-card">
        <div className="relative aspect-[21/9] w-full lg:aspect-[3/1]">
          <ProductMedia
            src=""
            alt="کارگاه مجسمه سعیدی"
            titleFa="مجسمه سعیدی"
            sizes="100vw"
            imageClassName="object-cover"
          />
        </div>
      </section>

      <section className="ds-container ds-section">
        <h2 className="ds-title text-foreground">آنچه برایمان مهم است</h2>
        <ul className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <li key={pillar.titleFa} className="bg-card p-6">
              <span data-numeric className="ds-overline">
                {new Intl.NumberFormat("fa-IR").format(index + 1).padStart(2, "۰")}
              </span>
              <h3 className="ds-heading mt-3 text-foreground">{pillar.titleFa}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pillar.bodyFa}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border">
        <div className="ds-container ds-section flex flex-col items-center text-center">
          <h2 className="ds-title text-foreground">مجموعه را ببینید</h2>
          <p className="ds-prose mt-3 text-center">
            آثار موجود را مرور کنید یا برای سفارش اختصاصی با ما در تماس باشید.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="luxury" size="touch" className="group gap-2 px-6" asChild>
              <Link href="/products">
                مشاهده آثار
                <ArrowLeft
                  className="size-4 transition-transform duration-base ease-out group-hover:-translate-x-1"
                  aria-hidden
                />
              </Link>
            </Button>
            <Button variant="outline" size="touch" className="px-6" asChild>
              <Link href="/contact">تماس با ما</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
