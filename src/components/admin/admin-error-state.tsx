"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function AdminErrorState({
  title = "خطا در بارگذاری",
  description = "مشکلی در دریافت اطلاعات پیش آمد. لطفاً دوباره تلاش کنید.",
  onRetry,
  className,
}: AdminErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center border border-destructive/40 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
    >
      <AlertTriangle className="size-8 stroke-[1.4] text-destructive" aria-hidden />
      <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {onRetry ? (
        <Button
          variant="outline"
          size="touch"
          className="mt-6 gap-2 px-6"
          type="button"
          onClick={onRetry}
        >
          <RotateCcw className="size-4" aria-hidden />
          تلاش مجدد
        </Button>
      ) : null}
    </div>
  );
}
