import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  /** اگر داده شود کل کارت به آن صفحه لینک می‌شود */
  href?: string;
  /** برای برجسته کردن وضعیت‌هایی که نیاز به اقدام دارند */
  tone?: "default" | "attention";
  className?: string;
};

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "default",
  className,
}: AdminStatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        {Icon ? (
          <Icon
            className={cn(
              "size-4 shrink-0 stroke-[1.6]",
              tone === "attention" ? "text-primary" : "text-muted-foreground/70",
            )}
            aria-hidden
          />
        ) : null}
      </div>

      <p
        data-numeric
        className="mt-3 text-2xl font-bold tracking-tight text-foreground"
      >
        {value}
      </p>

      {hint ? (
        <p className="mt-1 text-[0.6875rem] text-muted-foreground">{hint}</p>
      ) : null}

      {href ? (
        <span className="mt-3 inline-flex items-center gap-1 text-[0.6875rem] font-medium text-primary">
          مشاهده
          <ArrowLeft
            className="size-3 transition-transform duration-base group-hover:-translate-x-1"
            aria-hidden
          />
        </span>
      ) : null}
    </>
  );

  const base = cn(
    "block border bg-card p-4 transition-colors duration-fast",
    tone === "attention" ? "border-primary/40" : "border-border",
    href && "group hover:border-primary/40",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {body}
      </Link>
    );
  }

  return <div className={base}>{body}</div>;
}
