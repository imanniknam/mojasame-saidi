import type { OrderStatus, PaymentProvider, PaymentStatus } from "@prisma/client";
import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

export const orderStatusLabels: Record<OrderStatus, string> = {
  DRAFT: "پیش‌نویس",
  AWAITING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغو‌شده",
  REFUNDED: "مسترد",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "در انتظار",
  AUTHORIZED: "تأیید اولیه",
  CAPTURED: "پرداخت موفق",
  FAILED: "ناموفق",
  REFUNDED: "مسترد",
  VOIDED: "باطل",
};

export const paymentProviderLabels: Record<PaymentProvider, string> = {
  MANUAL: "دستی",
  ZARINPAL: "زرین‌پال",
  IDPAY: "آیدی‌پی",
  SNAPP_PAY: "اسنپ‌پی",
  OTHER: "سایر",
};

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const orderStatusBadgeVariant: Record<OrderStatus, BadgeVariant> = {
  DRAFT: "muted",
  AWAITING_PAYMENT: "outline",
  PAID: "success",
  PROCESSING: "highlight",
  SHIPPED: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "muted",
};

export const paymentStatusBadgeVariant: Record<PaymentStatus, BadgeVariant> = {
  PENDING: "outline",
  AUTHORIZED: "secondary",
  CAPTURED: "success",
  FAILED: "destructive",
  REFUNDED: "muted",
  VOIDED: "destructive",
};
