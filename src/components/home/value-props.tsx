import { Award, Gift, PenTool, Truck, type LucideIcon } from "lucide-react";

/** نگاشت نام آیکون ذخیره‌شده در StoreSettings.trustBadges به آیکون واقعی */
const ICONS: Record<string, LucideIcon> = {
  award: Award,
  shield: Award,
  sparkles: Award,
  pen: PenTool,
  design: PenTool,
  truck: Truck,
  gift: Gift,
};

export type ValueProp = {
  icon: string;
  titleFa: string;
  descriptionFa?: string | null;
};

/** پیش‌فرض‌ها — فقط وقتی استفاده می‌شوند که StoreSettings چیزی نداشته باشد */
export const DEFAULT_VALUE_PROPS: ValueProp[] = [
  { icon: "award", titleFa: "ساخت با کیفیت بالا", descriptionFa: "استفاده از بهترین متریال" },
  { icon: "pen", titleFa: "طراحی منحصر به فرد", descriptionFa: "آثار اختصاصی و محدود" },
  { icon: "truck", titleFa: "ارسال سریع و مطمئن", descriptionFa: "به سراسر کشور" },
  { icon: "gift", titleFa: "بسته‌بندی لوکس", descriptionFa: "مناسب هدیه و کلکسیون" },
];

/** نوار ارزش‌ها — درست زیر قهرمان، روی پنل یک پله روشن‌تر */
export function ValueProps({ items }: { items: ValueProp[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-border bg-card-elevated" aria-label="مزیت‌های خرید">
      <div className="ds-container">
        <ul className="grid grid-cols-2 divide-border sm:divide-x sm:divide-x-reverse lg:grid-cols-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? Award;
            return (
              <li
                key={item.titleFa}
                className="flex items-center gap-3 px-2 py-5 sm:px-5 sm:py-6"
              >
                <Icon
                  className="size-6 shrink-0 stroke-[1.4] text-primary sm:size-7"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground sm:text-sm">
                    {item.titleFa}
                  </p>
                  {item.descriptionFa ? (
                    <p className="mt-0.5 line-clamp-1 text-[0.6875rem] text-muted-foreground">
                      {item.descriptionFa}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
