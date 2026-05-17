"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card
      elevated
      className={cn(
        "flex flex-col items-center justify-center rounded-[1.75rem] border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <div
        className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive"
        aria-hidden
      >
        <AlertTriangle className="size-7" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" size="touch" className="mt-6 gap-2" type="button" onClick={onRetry}>
          <RotateCcw className="size-4" />
          تلاش مجدد
        </Button>
      ) : null}
    </Card>
  );
}
