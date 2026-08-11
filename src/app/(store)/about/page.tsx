import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "درباره ما",
  description:
    "مجسمه سعیدی؛ آثار دست‌ساز دکوراتیو با تمرکز بر جزئیات، کیفیت ساخت و احترام به هنر کلاسیک و مدرن.",
  path: "/about",
});

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
    <main className="mb-nav overflow-hidden">
      <section
        className="relative isolate min-h-[clamp(34rem,72vh,48rem)] border-b border-border"
        aria-labelledby="about-title"
      >
        <Image
          src="/images/brand/about-hero.webp"
          alt="گالری تاریک آثار کلاسیک و مجسمه‌های مرمرین"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[52%_center]"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/35 to-background/25"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-l from-background/80 via-transparent to-background/25"
          aria-hidden
        />

        <div className="ds-container flex min-h-[clamp(34rem,72vh,48rem)] flex-col py-6">
          <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "درباره ما" }]} />

          <div className="mt-auto max-w-2xl pb-12 sm:pb-16 lg:pb-20">
            <p className="ds-overline">Our story</p>
            <h1
              id="about-title"
              className="ds-display mt-3 max-w-[12ch] text-foreground drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]"
            >
              داستان مجسمه سعیدی
            </h1>
            <p className="ds-body mt-6 max-w-xl text-foreground/80 drop-shadow-[0_1px_12px_rgba(0,0,0,0.95)]">
              هنر برای ما فقط یک شیء زیبا نیست؛ حضوری ماندگار است که به فضا شخصیت،
              سکوت و اصالت می‌بخشد.
            </p>
          </div>
        </div>
      </section>

      <section className="ds-container ds-section">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="ds-overline">The atelier</p>
            <h2 className="ds-title mt-3 text-foreground">از طرح تا اثری برای ماندن</h2>
            <span className="mt-5 block h-px w-20 bg-primary/60" aria-hidden />
            <div className="mt-6 space-y-4">
              <p className="ds-body">
                ما در مجسمه سعیدی، با عشق به هنر و جزئیات، آثاری خلق می‌کنیم که فراتر از
                دکوراسیون به فضاها شخصیت و اصالت می‌بخشند.
              </p>
              <p className="ds-body">
                هر مجسمه، نتیجه‌ی دقت در طراحی، کیفیت در ساخت و احترام به هنر کلاسیک و
                مدرن است. هدف‌مان این است که هر اثر، سال‌ها بعد هم در خانه‌ی شما تازه
                بماند.
              </p>
            </div>
          </div>

          <figure className="relative aspect-square overflow-hidden border border-border lg:col-span-7 lg:aspect-[4/3]">
            <Image
              src="/images/brand/gallery-corridor.webp"
              alt="راهروی باشکوهی با مجموعه‌ای از مجسمه‌های کلاسیک"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-transparent"
              aria-hidden
            />
          </figure>
        </div>
      </section>

      <section className="border-y border-border bg-card" aria-labelledby="gallery-title">
        <div className="ds-container ds-section">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="ds-overline">Inspiration</p>
              <h2 id="gallery-title" className="ds-title mt-2 text-foreground">
                میراث فرم و فضا
              </h2>
            </div>
            <p className="hidden max-w-sm text-sm leading-relaxed text-muted-foreground md:block">
              گفت‌وگویی میان نور، معماری و پیکره؛ جایی که هر اثر بخشی از فضای زندگی
              می‌شود.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-12">
            <figure className="relative aspect-[4/3] overflow-hidden border border-border md:col-span-7">
              <Image
                src="/images/brand/gallery-classical.webp"
                alt="تالار روشن مجموعه‌ای از سردیس‌ها و آثار کلاسیک"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover transition-transform duration-slow ease-out hover:scale-[1.02]"
              />
            </figure>
            <figure className="relative aspect-[4/3] overflow-hidden border border-border md:col-span-5">
              <Image
                src="/images/brand/gallery-gilded.webp"
                alt="تالار طلایی با سردیس‌های هنری"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover transition-transform duration-slow ease-out hover:scale-[1.02]"
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="ds-container ds-section" aria-labelledby="values-title">
        <p className="ds-overline">Our values</p>
        <h2 id="values-title" className="ds-title mt-2 text-foreground">
          آنچه برایمان مهم است
        </h2>
        <ul className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <li key={pillar.titleFa} className="bg-card p-6 lg:p-8">
              <span data-numeric className="ds-overline">
                {new Intl.NumberFormat("fa-IR").format(index + 1).padStart(2, "۰")}
              </span>
              <h3 className="ds-heading mt-4 text-foreground">{pillar.titleFa}</h3>
              <p className="mt-3 text-sm leading-[1.9] text-muted-foreground">
                {pillar.bodyFa}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative isolate border-t border-border py-16 sm:py-20">
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.1),transparent_55%)]"
          aria-hidden
        />
        <div className="ds-container flex flex-col items-center text-center">
          <p className="ds-overline">The collection</p>
          <h2 className="ds-title mt-3 text-foreground">مجموعه را ببینید</h2>
          <p className="ds-prose mt-4 text-center">
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
