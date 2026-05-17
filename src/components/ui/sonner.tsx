"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

/** اعلان‌ها — راست‌چین و هماهنگ با توکن‌های طراحی */
function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      dir="rtl"
      position="top-center"
      className="toaster group"
      toastOptions={{
        duration: 4200,
        classNames: {
          toast: cn(
            "group toast group-[.toaster]:shadow-card group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border/80 group-[.toaster]:rounded-xl",
          ),
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
